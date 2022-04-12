from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import get_current_active_superuser
from app.db.session import get_db
from app.db.taxon_name.crud import TaxonNameCrud
from app.db.taxon_name.schema import TaxonName, TaxonNameCreate, TaxonNameEdit

taxon_names_router = r = APIRouter(prefix="/taxon_names")


@r.get(
    "",
    response_model=List[TaxonName],
    response_model_exclude_none=True,
)
async def taxon_name_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all taxon_names
    """
    total, taxon_names = TaxonNameCrud.get_items(
        db, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{total}"
    return taxon_names


@r.get(
    "/{taxon_name_id}",
    response_model=TaxonName,
    response_model_exclude_none=True,
)
async def taxon_name_details(
    request: Request,
    taxon_name_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any taxon_name details
    """
    taxon_name = TaxonNameCrud.get_item(db, taxon_name_id)
    return taxon_name


@r.post("", response_model=TaxonName, response_model_exclude_none=True)
async def taxon_name_create(
    request: Request,
    taxon_name: TaxonNameCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new taxon_name
    """
    return TaxonNameCrud.create_item(db, taxon_name, current_user.user_id)


@r.put(
    "/{taxon_name_id}",
    response_model=TaxonName,
    response_model_exclude_none=True,
)
async def taxon_name_edit(
    request: Request,
    taxon_name_id: int,
    taxon_name: TaxonNameEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing taxon_name
    """
    return TaxonNameCrud.edit_item(db, taxon_name_id, taxon_name, current_user.user_id)


@r.delete(
    "/{taxon_name_id}",
    response_model=TaxonName,
    response_model_exclude_none=True,
)
async def taxon_name_delete(
    request: Request,
    taxon_name_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing taxon_name
    """
    return TaxonNameCrud.delete_item(db, taxon_name_id)
