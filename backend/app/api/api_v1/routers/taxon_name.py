from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser, get_current_active_user
from app.db.taxon_name.crud import create_taxon_name, delete_taxon_name, edit_taxon_name, get_taxon_name, get_taxon_names
from app.db.schemas import TaxonName, TaxonNameCreate, TaxonNameEdit
from app.db.session import get_db

taxon_names_router = r = APIRouter()


@r.get(
    "/taxon_names",
    response_model=List[TaxonName],
    response_model_exclude_none=True,
)
async def taxon_name_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all taxon_names
    """
    taxon_names = get_taxon_names(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(taxon_names)}"
    return taxon_names


@r.get(
    "/taxon_names/{taxon_name_id}",
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
    taxon_name = get_taxon_name(db, taxon_name_id)
    return taxon_name


@r.post("/taxon_names", response_model=TaxonName, response_model_exclude_none=True)
async def taxon_name_create(
    request: Request,
    taxon_name: TaxonNameCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new taxon_name
    """
    return create_taxon_name(db, taxon_name)


@r.put(
    "/taxon_names/{taxon_name_id}", response_model=TaxonName, response_model_exclude_none=True
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
    return edit_taxon_name(db, taxon_name_id, taxon_name)


@r.delete(
    "/taxon_names/{taxon_name_id}", response_model=TaxonName, response_model_exclude_none=True
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
    return delete_taxon_name(db, taxon_name_id)
