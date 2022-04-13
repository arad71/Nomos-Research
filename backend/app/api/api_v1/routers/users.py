from typing import List, Optional

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.user.crud import UserCrud
from app.db.user.schema import User, UserCreate, UserEdit

users_router = r = APIRouter(prefix="/users")


@r.get(
    "",
    response_model=List[User],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def users_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
):
    """
    Get all users
    """
    users, content_range = UserCrud.get_items(
        db, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return users


@r.get("/me", response_model=User, response_model_exclude_none=True)
async def user_me(current_user: User = Depends(get_current_active_user)):
    """
    Get own user
    """
    return current_user


@r.get(
    "/{user_id}",
    response_model=User,
    response_model_exclude_none=True,
    dependencies=[
        authorize(),
    ],
)
async def user_details(
    user_id: int,
    db=Depends(get_db),
):
    """
    Get any user details
    """
    user = UserCrud.get_item(db, user_id)
    return user


@r.post(
    "",
    response_model=User,
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
async def user_create(
    user: UserCreate,
    db=Depends(get_db),
):
    """
    Create a new user
    """
    return UserCrud.create_item(db, user)


@r.put(
    "/{user_id}",
    response_model=User,
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
async def user_edit(
    user_id: int,
    user: UserEdit,
    db=Depends(get_db),
):
    """
    Update existing user
    """
    return UserCrud.edit_item(
        db,
        user_id,
        user,
    )


@r.delete(
    "/{user_id}",
    response_model=User,
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
async def user_delete(
    user_id: int,
    db=Depends(get_db),
):
    """
    Delete existing user
    """
    return UserCrud.delete_item(db, user_id)
