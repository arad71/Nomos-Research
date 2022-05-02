from typing import List, Optional

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.taxon_name.crud import TaxonNameCrud
from app.db.taxon_name.schema import TaxonName, TaxonNameCreate, TaxonNameEdit
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
):
    """
    Get all taxon_names
    """
    taxon_names, content_range = TaxonNameCrud.get_items(
        db, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return taxon_names


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
):
    """
    Get any taxon_name details
    """
    taxon_name = TaxonNameCrud.get_item(db, taxon_name_id)
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
    return TaxonNameCrud.edit_item(db, taxon_name_id, taxon_name, current_user.user_id)


@r.delete(
    "/{taxon_name_id}",
    response_model=TaxonName,
    response_model_exclude_none=True,
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
):
    """
    Delete existing taxon_name
    """
    return TaxonNameCrud.delete_item(db, taxon_name_id)
