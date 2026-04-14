import json
from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock, Thread
from typing import List, Optional, overload

import fastapi.responses as responses
from fastapi import APIRouter, BackgroundTasks, Depends, Response
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, aliased

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.hierarchy.model import Hierarchy
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.taxon_name.crud import CALCULATE_LOG, TaxonNameCrud
from app.db.taxon_name.infrageneric_names import InfraGenericNameModel
from app.db.taxon_name.model import TaxonName as TaxonNameModel
from app.db.taxon_name.schema import (
    TaxonName,
    TaxonNameCreate,
    TaxonNameEdit,
    TaxonNameParallelAuditJobStatus,
    TaxonNameParallelAuditMismatch,
    TaxonNameParallelAuditResult,
    TaxonNameParallelPreview,
)
from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User
from app.tools.audit_parallel_name_engine import audit_parallel_name_engine

taxon_names_router = r = APIRouter(prefix="/taxon_names")


_PARALLEL_AUDIT_LOCK = Lock()
_PARALLEL_AUDIT_STATE: dict = {
    "status": "idle",
    "strict": True,
    "current_only": True,
    "batch_size": 500,
    "mismatch_limit": 2000,
    "expected_total": 0,
    "processed": 0,
    "matches_all": 0,
    "scientific_mismatch": 0,
    "author_only_scientific_mismatch": 0,
    "canonical_mismatch": 0,
    "both_mismatch": 0,
    "errors": 0,
    "started_at": None,
    "finished_at": None,
    "error_message": None,
    "result": None,
}


def _snapshot_parallel_audit_state() -> dict:
    with _PARALLEL_AUDIT_LOCK:
        return deepcopy(_PARALLEL_AUDIT_STATE)


def _set_parallel_audit_state(**updates) -> None:
    with _PARALLEL_AUDIT_LOCK:
        _PARALLEL_AUDIT_STATE.update(updates)


def _stats_to_result(
    *,
    strict: bool,
    current_only: bool,
    stats,
) -> TaxonNameParallelAuditResult:
    return TaxonNameParallelAuditResult(
        strict=strict,
        current_only=current_only,
        processed=stats.processed,
        matches_all=stats.matches_all,
        scientific_mismatch=stats.scientific_mismatch,
        author_only_scientific_mismatch=stats.author_only_scientific_mismatch,
        canonical_mismatch=stats.canonical_mismatch,
        both_mismatch=stats.both_mismatch,
        errors=stats.errors,
        mismatch_rows=[
            TaxonNameParallelAuditMismatch(
                taxon_name_id=row.taxon_name_id,
                mismatch_kind=row.mismatch_kind,
                strategy=row.strategy,
                current_scientific_name=row.current_scientific_name,
                derived_scientific_name=row.derived_scientific_name,
                current_canonical_name=row.current_canonical_name,
                derived_canonical_name=row.derived_canonical_name,
            )
            for row in stats.mismatch_rows
        ],
    )


@r.get(
    "",
    response_model=List[TaxonName],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def taxon_name_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get all taxon_names
    """
    taxon_names, content_range = TaxonNameCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return taxon_names


@r.get(
    "_infrageneric_names/{taxon_name_id}", response_model=List[InfraGenericNameModel]
)
async def taxon_infrageneric_name_list(
    taxon_name_id: int,
    db: Session = Depends(get_db),
):
    result = TaxonNameCrud.generate_infrageneric_names(db, taxon_name_id)
    return result


@r.get(
    "_parallel_name_preview/{taxon_name_id}",
    response_model=TaxonNameParallelPreview,
)
@r.get(
    "/_parallel_name_preview/{taxon_name_id}",
    response_model=TaxonNameParallelPreview,
)
async def taxon_parallel_name_preview(
    taxon_name_id: int,
    strict: bool = False,
    db: Session = Depends(get_db),
):
    return TaxonNameCrud.generate_parallel_name_preview(
        db, taxon_name_id, strict=strict
    )


@r.post(
    "_parallel_name_audit",
    response_model=TaxonNameParallelAuditResult,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
@r.post(
    "/_parallel_name_audit",
    response_model=TaxonNameParallelAuditResult,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_parallel_name_audit(
    strict: bool = True,
    current_only: bool = True,
    batch_size: int = 500,
    mismatch_limit: int = 2000,
):
    stats = audit_parallel_name_engine(
        strict=strict,
        current_only=current_only,
        offset=0,
        limit=None,
        batch_size=batch_size,
        log_every=0,
        sample_size=0,
        collect_mismatches=True,
        mismatch_limit=mismatch_limit,
    )
    return _stats_to_result(strict=strict, current_only=current_only, stats=stats)


@r.post(
    "_parallel_name_audit_start",
    response_model=TaxonNameParallelAuditJobStatus,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
@r.post(
    "/_parallel_name_audit_start",
    response_model=TaxonNameParallelAuditJobStatus,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_parallel_name_audit_start(
    strict: bool = True,
    current_only: bool = True,
    batch_size: int = 500,
    mismatch_limit: int = 2000,
):
    state = _snapshot_parallel_audit_state()
    if state.get("status") == "running":
        return TaxonNameParallelAuditJobStatus(**state)

    _set_parallel_audit_state(
        status="running",
        strict=strict,
        current_only=current_only,
        batch_size=batch_size,
        mismatch_limit=mismatch_limit,
        expected_total=0,
        processed=0,
        matches_all=0,
        scientific_mismatch=0,
        author_only_scientific_mismatch=0,
        canonical_mismatch=0,
        both_mismatch=0,
        errors=0,
        started_at=datetime.now(timezone.utc).isoformat(),
        finished_at=None,
        error_message=None,
        result=None,
    )

    def _run_job() -> None:
        def _progress_callback(stats) -> None:
            _set_parallel_audit_state(
                expected_total=stats.expected_total,
                processed=stats.processed,
                matches_all=stats.matches_all,
                scientific_mismatch=stats.scientific_mismatch,
                author_only_scientific_mismatch=stats.author_only_scientific_mismatch,
                canonical_mismatch=stats.canonical_mismatch,
                both_mismatch=stats.both_mismatch,
                errors=stats.errors,
            )

        try:
            stats = audit_parallel_name_engine(
                strict=strict,
                current_only=current_only,
                offset=0,
                limit=None,
                batch_size=batch_size,
                log_every=1000,
                sample_size=0,
                collect_mismatches=True,
                mismatch_limit=mismatch_limit,
                progress_callback=_progress_callback,
            )
            result = _stats_to_result(
                strict=strict,
                current_only=current_only,
                stats=stats,
            )
            _set_parallel_audit_state(
                status="completed",
                expected_total=stats.expected_total,
                processed=stats.processed,
                matches_all=stats.matches_all,
                scientific_mismatch=stats.scientific_mismatch,
                author_only_scientific_mismatch=stats.author_only_scientific_mismatch,
                canonical_mismatch=stats.canonical_mismatch,
                both_mismatch=stats.both_mismatch,
                errors=stats.errors,
                finished_at=datetime.now(timezone.utc).isoformat(),
                error_message=None,
                result=result.model_dump(),
            )
        except Exception as error:
            _set_parallel_audit_state(
                status="failed",
                finished_at=datetime.now(timezone.utc).isoformat(),
                error_message=str(error),
            )

    Thread(target=_run_job, daemon=True).start()
    return TaxonNameParallelAuditJobStatus(**_snapshot_parallel_audit_state())


@r.get(
    "_parallel_name_audit_status",
    response_model=TaxonNameParallelAuditJobStatus,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
@r.get(
    "/_parallel_name_audit_status",
    response_model=TaxonNameParallelAuditJobStatus,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_parallel_name_audit_status():
    state = _snapshot_parallel_audit_state()
    result = state.get("result")
    if isinstance(result, dict):
        state["result"] = TaxonNameParallelAuditResult(**result)
    return TaxonNameParallelAuditJobStatus(**state)


@r.get(
    "_ancestors/{rank}",
    dependencies=[authorize()],
)
async def taxon_name_ancestors(
    response: Response,
    rank: str = None,
    filter: Optional[str] = None,
    range: Optional[str] = RangeQueryParameter,
    db: Session = Depends(get_db),
):
    tables = {}

    limit, skip, range_str = TaxonNameCrud.get_skip_and_limit(range)
    tables["original_name"] = taxon_name = aliased(TaxonNameModel, name="original_name")
    tables["hierarchy"] = hierarchy = aliased(Hierarchy, name="hierarchy")
    tables["ancestor"] = ancestor = aliased(Hierarchy, name="ancestor")
    tables["ancestor_name"] = ancestor_name = aliased(
        TaxonNameModel, name="ancestor_name"
    )
    taxon_rank = aliased(TaxonRank, name="rank")
    statement = (
        select(
            taxon_name.taxon_name_id.label("id"),
            taxon_rank.rank_name.label("rank__rank_name"),
            ancestor_name.taxon_name_id.label("ancestor_name__taxon_name_id"),
            ancestor_name.canonical_name.label("ancestor_name__canonical_name"),
            ancestor_name.scientific_name.label("ancestor_name__scientific_name"),
            ancestor_name.formatted_scientific_name.label(
                "ancestor_name__formatted_scientific_name"
            ),
        )
        .join(
            hierarchy,
            onclause=hierarchy.taxon_name_id == taxon_name.taxon_name_id,
        )
        .join(
            ancestor,
            onclause=hierarchy.path.descendant_of(ancestor.path),
        )
        .join(
            ancestor_name,
            onclause=ancestor.taxon_name_id == ancestor_name.taxon_name_id,
        )
        .join(
            taxon_rank,
            onclause=and_(
                ancestor_name.rank_id == taxon_rank.taxon_rank_id,
                taxon_rank.rank_name == rank,
            ),
        )
    )

    filter_items = json.loads(filter) if filter else None

    if filter_items:
        column: str
        for column in filter_items:
            if column == "id":
                field_name = "taxon_name_id"
                table_name = "original_name"
            else:
                table_name, field_name = column.split("__")
            table = tables.get(table_name)
            if table:
                field = getattr(table, field_name)
                if field:
                    filter_value = filter_items[column]
                    if isinstance(filter_value, list):
                        statement = statement.filter(field.in_(filter_value))

                    else:
                        statement = statement.filter == filter_value
    statement = statement.filter(
        and_(
            taxon_name.deleted == False,  # noqa: E712
            hierarchy.deleted == False,  # noqa: E712
            ancestor.deleted == False,  # noqa: E712
            ancestor_name.deleted == False,  # noqa: E712
            taxon_rank.deleted == False,  # noqa: E712
        )
    )

    count_query = statement.with_only_columns(func.count(taxon_name.taxon_name_id))
    count = db.execute(count_query).scalar_one()
    response.headers["Content-Range"] = f"{skip}-{min(limit - 1 + skip, count)}/{count}"
    statement = statement.limit(limit).offset(skip)
    result = db.execute(statement)
    return result.all()


@r.get(
    "/{taxon_name_id}",
    response_model=TaxonName,
    response_model_exclude_none=True,
    dependencies=[
        authorize(),
    ],
)
async def taxon_name_details(
    taxon_name_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get any taxon_name details
    """
    taxon_name = TaxonNameCrud.get_item(db, current_user, taxon_name_id)
    return taxon_name


@r.post(
    "",
    response_model=TaxonName,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_name_create(
    taxon_name: TaxonNameCreate,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new taxon_name
    """
    return TaxonNameCrud.create_item(db, taxon_name, current_user.user_id)


@r.put(
    "/{taxon_name_id}",
    response_model=TaxonName,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_name_edit(
    taxon_name_id: int,
    taxon_name: TaxonNameEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing taxon_name
    """
    return TaxonNameCrud.edit_item(db, current_user, taxon_name_id, taxon_name)


@overload
@r.delete(
    "/{taxon_name_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def taxon_name_delete(
    taxon_name_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing taxon_name
    """
    return TaxonNameCrud.delete_item(db, current_user, taxon_name_id)


@r.delete(
    "/{taxon_name_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_name_delete(
    taxon_name_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing taxon_name
    """
    return TaxonNameCrud.delete_item(db, current_user, taxon_name_id, True)


@r.post(
    "/{taxon_name_id}/restore",
    response_model=TaxonName,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_name_restore(
    taxon_name_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Restore a soft deleted taxon_name
    """
    return TaxonNameCrud.undelete_item(db, current_user, taxon_name_id)


@r.get(
    "_calculate",
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
    response_class=responses.FileResponse,
)
def get_calculation_log():
    return responses.FileResponse(CALCULATE_LOG)


@r.post(
    "_calculate",
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
    response_class=responses.FileResponse,
)
def recalculate_name_formats(
    background_tasks: BackgroundTasks,
    taxon_name_id: Optional[int] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = 0,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db),
):
    background_tasks.add_task(
        TaxonNameCrud.calculate_name_formats,
        db,
        taxon_name_id,
        current_user.user_id,
        limit,
        offset,
    )
    return responses.FileResponse(CALCULATE_LOG)
