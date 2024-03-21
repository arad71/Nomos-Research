from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.conscode_taxon.crud import ConscodetaxonCrud
from app.db.conscode_taxon.schema import Conscodetaxon, ConscodetaxonCreate, ConscodetaxonEdit
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.user.schema import User

conscode_taxons_router = r = APIRouter(prefix="/conscode_taxons")


@r.get(
    "",
    response_model=List[Conscodetaxon],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def conscode_taxon_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get all conscode_taxon
    """
    conscode_taxons, content_range = ConscodetaxonCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return conscode_taxons


@r.get(
    "/{conscode_taxon_id}",
    response_model=Conscodetaxon,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def conscode_taxon_details(
    conscode_taxon_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get any cons code details
    """
    conscode_taxon = ConscodetaxonCrud.get_item(db, current_user, conscode_taxon_id)
    return conscode_taxon


@r.post(
    "",
    response_model=Conscodetaxon,
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
async def conscode_taxon_create(
    conscode_taxon: ConscodetaxonCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Create a new cons code
    """
    return ConscodetaxonCrud.create_item(db, conscode_taxon, current_user.user_id)


@r.put(
    "/{conscode_taxon_id}",
    response_model=Conscodetaxon,
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
async def conscode_taxon_edit(
    conscode_taxon_id: int,
    conscode_taxon: ConscodetaxonEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing cons
    """
    return ConscodetaxonCrud.edit_item(db, current_user, conscode_taxon_id, conscode_taxon)


@overload
@r.delete(
    "/{conscode_taxon_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def conscode_taxon_delete(
    conscode_taxon_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing cons
    """
    return ConscodetaxonCrud.delete_item(db, current_user, conscode_taxon_id)


@r.delete(
    "/{conscode_taxon_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def conscode_taxon_delete(
    conscode_taxon_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing cons
    """
    return ConscodetaxonCrud.delete_item(db, current_user, conscode_taxon_id, True)
