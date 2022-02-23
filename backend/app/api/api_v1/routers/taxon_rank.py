from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser
from app.db.session import get_db
from app.db.taxon_rank.crud import TaxonRankCrud
from app.db.taxon_rank.schema import TaxonRank, TaxonRankCreate, TaxonRankEdit

taxon_ranks_router = r = APIRouter(prefix="/taxon_ranks")


@r.get(
    "",
    response_model=List[TaxonRank],
    response_model_exclude_none=True,
)
async def taxon_rank_list(
    response: Response,
    range: str = "[0,10]",
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all taxon_ranks
    """
    taxon_ranks = TaxonRankCrud.get_items(db, range=range)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(taxon_ranks)}"
    return taxon_ranks


@r.get(
    "/{taxon_rank_id}",
    response_model=TaxonRank,
    response_model_exclude_none=True,
)
async def taxon_rank_details(
    request: Request,
    taxon_rank_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any taxon_rank details
    """
    taxon_rank = TaxonRankCrud.get_item(db, taxon_rank_id)
    return taxon_rank


@r.post("", response_model=TaxonRank, response_model_exclude_none=True)
async def taxon_rank_create(
    request: Request,
    taxon_rank: TaxonRankCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new taxon_rank
    """
    return TaxonRankCrud.create_item(db, taxon_rank, current_user.user_id)


@r.put(
    "/{taxon_rank_id}",
    response_model=TaxonRank,
    response_model_exclude_none=True,
)
async def taxon_rank_edit(
    request: Request,
    taxon_rank_id: int,
    taxon_rank: TaxonRankEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing taxon_rank
    """
    return TaxonRankCrud.edit_item(db, taxon_rank_id, taxon_rank, current_user.user_id)


@r.delete(
    "/{taxon_rank_id}",
    response_model=TaxonRank,
    response_model_exclude_none=True,
)
async def taxon_rank_delete(
    request: Request,
    taxon_rank_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing taxon_rank
    """
    return TaxonRankCrud.delete_item(db, taxon_rank_id)
