from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import get_current_active_superuser, get_current_active_user
from app.db.session import get_db
from app.db.user.crud import UserCrud
from app.db.user.schema import User, UserCreate, UserEdit

users_router = r = APIRouter(prefix="/users")


@r.get(
    "",
    response_model=List[User],
    response_model_exclude_none=True,
)
async def users_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all users
    """
    users = UserCrud.get_items(db, range=range, sort=sort)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{UserCrud.get_items_count(db)}"
    return users


@r.get("/me", response_model=User, response_model_exclude_none=True)
async def user_me(current_user=Depends(get_current_active_user)):
    """
    Get own user
    """
    return current_user


@r.get(
    "/{user_id}",
    response_model=User,
    response_model_exclude_none=True,
)
async def user_details(
    request: Request,
    user_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any user details
    """
    user = UserCrud.get_item(db, user_id)
    return user
    # return encoders.jsonable_encoder(
    #     user, skip_defaults=True, exclude_none=True,
    # )


@r.post("", response_model=User, response_model_exclude_none=True)
async def user_create(
    request: Request,
    user: UserCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new user
    """
    return UserCrud.create_item(db, user)


@r.put("/{user_id}", response_model=User, response_model_exclude_none=True)
async def user_edit(
    request: Request,
    user_id: int,
    user: UserEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing user
    """
    return UserCrud.edit_item(db, user_id, user)


@r.delete("/{user_id}", response_model=User, response_model_exclude_none=True)
async def user_delete(
    request: Request,
    user_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing user
    """
    return UserCrud.delete_item(db, user_id)
