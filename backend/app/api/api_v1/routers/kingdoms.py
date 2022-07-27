from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.kingdom.crud import KingdomCrud
from app.db.kingdom.schema import Kingdom, KingdomCreate, KingdomEdit
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.user.schema import User

kingdoms_router = r = APIRouter(prefix="/kingdoms")


@r.get(
    "",
    response_model=List[Kingdom],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def kingdom_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get all kingdoms
    """
    kingdoms, content_range = KingdomCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return kingdoms


@r.get(
    "/{kingdom_id}",
    response_model=Kingdom,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def kingdom_details(
    kingdom_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get any kingdom details
    """
    return KingdomCrud.get_item(db, current_user, kingdom_id)


@r.post(
    "",
    response_model=Kingdom,
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
async def kingdom_create(
    kingdom: KingdomCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Create a new kingdom
    """
    return KingdomCrud.create_item(db, kingdom, current_user.user_id)


@r.put(
    "/{kingdom_id}",
    response_model=Kingdom,
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
async def kingdom_edit(
    kingdom_id: int,
    kingdom: KingdomEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing kingdom
    """
    return KingdomCrud.edit_item(db, current_user, kingdom_id, kingdom)


@overload
@r.delete(
    "/{kingdom_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def kingdom_delete(
    kingdom_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing kingdom
    """
    return KingdomCrud.delete_item(db, current_user, kingdom_id)


@r.delete(
    "/{kingdom_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def kingdom_delete(
    kingdom_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing kingdom
    """
    return KingdomCrud.delete_item(db, current_user, kingdom_id, True)
