from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.taxon_rank.crud import TaxonRankCrud
from app.db.taxon_rank.schema import TaxonRank, TaxonRankCreate, TaxonRankEdit

taxon_ranks_router = r = APIRouter(prefix="/taxon_ranks")


@r.get(
    "",
    response_model=List[TaxonRank],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def taxon_rank_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get all taxon_ranks
    """
    taxon_ranks, content_range = TaxonRankCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return taxon_ranks


@r.get(
    "/{taxon_rank_id}",
    response_model=TaxonRank,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def taxon_rank_details(
    taxon_rank_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get any taxon_rank details
    """
    taxon_rank = TaxonRankCrud.get_item(db, current_user, taxon_rank_id)
    return taxon_rank


@r.post(
    "",
    response_model=TaxonRank,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_rank_create(
    taxon_rank: TaxonRankCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Create a new taxon_rank
    """
    return TaxonRankCrud.create_item(db, taxon_rank, current_user.user_id)


@r.put(
    "/{taxon_rank_id}",
    response_model=TaxonRank,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_rank_edit(
    taxon_rank_id: int,
    taxon_rank: TaxonRankEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing taxon_rank
    """
    return TaxonRankCrud.edit_item(db, current_user, taxon_rank_id, taxon_rank)


@overload
@r.delete(
    "/{taxon_rank_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_rank_delete(
    taxon_rank_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing taxon_rank
    """
    return TaxonRankCrud.delete_item(db, current_user, taxon_rank_id)


@r.delete(
    "/{taxon_rank_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_rank_delete(
    taxon_rank_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing taxon_rank
    """
    return TaxonRankCrud.delete_item(db, current_user, taxon_rank_id, True)
