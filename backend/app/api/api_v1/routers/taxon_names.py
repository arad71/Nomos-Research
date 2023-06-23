import json
from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, aliased

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.hierarchy.model import Hierarchy
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.taxon_name.crud import TaxonNameCrud
from app.db.taxon_name.infrageneric_names import InfraGenericNameModel
from app.db.taxon_name.model import TaxonName as TaxonNameModel
from app.db.taxon_name.schema import TaxonName, TaxonNameCreate, TaxonNameEdit
from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User

taxon_names_router = r = APIRouter(prefix="/taxon_names")


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
    "/infrageneric_names/{taxon_name_id}", response_model=List[InfraGenericNameModel]
)
async def taxon_name_list(
    taxon_name_id: int,
    db: Session = Depends(get_db),
):
    result = TaxonNameCrud.generate_infrageneric_names(db, taxon_name_id)
    return result


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
                        statement = statement.filter(field == filter_value)
    statement = statement.filter(
        and_(
            taxon_name.deleted == False,
            hierarchy.deleted == False,
            ancestor.deleted == False,
            ancestor_name.deleted == False,
            taxon_rank.deleted == False,
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
