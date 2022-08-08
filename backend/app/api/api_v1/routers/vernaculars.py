from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.user.model import User
from app.db.vernacular.crud import VernacularCrud
from app.db.vernacular.schema import Vernacular, VernacularCreate, VernacularEdit

vernaculars_router = r = APIRouter(prefix="/vernaculars")


@r.get(
    "",
    response_model=List[Vernacular],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def vernacular_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get all vernaculars
    """
    vernaculars, content_range = VernacularCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return vernaculars


@r.get(
    "/{vernacular_id}",
    response_model=Vernacular,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def vernacular_details(
    vernacular_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get any vernacular details
    """
    vernacular = VernacularCrud.get_item(db, current_user, vernacular_id)
    return vernacular


@r.post(
    "",
    response_model=Vernacular,
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
async def vernacular_create(
    vernacular: VernacularCreate,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new vernacular
    """
    return VernacularCrud.create_item(db, vernacular, current_user.user_id)


@r.put(
    "/{vernacular_id}",
    response_model=Vernacular,
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
async def vernacular_edit(
    vernacular_id: int,
    vernacular: VernacularEdit,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update existing vernacular
    """
    return VernacularCrud.edit_item(db, current_user, vernacular_id, vernacular)


@overload
@r.delete(
    "/{vernacular_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def vernacular_delete(
    vernacular_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete existing vernacular
    """
    return VernacularCrud.delete_item(db, current_user, vernacular_id)


@r.delete(
    "/{vernacular_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def vernacular_delete(
    vernacular_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete existing vernacular
    """
    return VernacularCrud.delete_item(db, current_user, vernacular_id, True)
