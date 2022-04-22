from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.user.model import User
from app.db.user_role.crud import UserRoleCrud
from app.db.user_role.schema import UserRole, UserRoleCreate, UserRoleEdit

user_roles_router = APIRouter(prefix="/user-roles")


@user_roles_router.get(
    "",
    response_model=list[UserRole],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def user_role_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    db=Depends(get_db),
):
    """
    Get all user_roles
    """
    user_roles, content_range = UserRoleCrud.get_items(db, range=range)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return user_roles


@user_roles_router.get(
    "/{user_role_id}",
    response_model=UserRole,
    response_model_exclude_none=True,
)
async def user_role_details(
    user_role_id: int,
    db=Depends(get_db),
):
    """
    Get any user_role details
    """
    return UserRoleCrud.get_item(db, user_role_id)


@user_roles_router.post(
    "",
    response_model=UserRole,
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
async def user_role_create(
    request: Request,
    user_role: UserRoleCreate,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new user_role
    """
    return UserRoleCrud.create_item(db, user_role, current_user.user_id)


@user_roles_router.put(
    "/{user_role_id}",
    response_model=UserRole,
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
async def user_role_edit(
    user_role_id: int,
    user_role: UserRoleEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing user_role
    """
    return UserRoleCrud.edit_item(db, user_role_id, user_role, current_user.user_id)


@user_roles_router.delete(
    "/{user_role_id}",
    response_model=UserRole,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def user_role_delete(
    user_role_id: int,
    db=Depends(get_db),
):
    """
    Delete existing user_role
    """
    return UserRoleCrud.delete_item(db, user_role_id)


@user_roles_router.post(
    "",
    response_model=UserRole,
    dependencies=[
        authorize(
            scopes=[
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
def assign_user_role(
    *,
    db: Session = Depends(get_db),
    user_role_in: UserRoleCreate,
) -> UserRole:
    """
    Assign a role to a user after creation of a user
    """
    user_role = UserRoleCrud.get_by_ids(
        db, user_id=user_role_in.user_id, role_id=user_role_in.role_id
    )
    if user_role is None:
        user_role = UserRoleCrud.create_item(db, item=user_role_in)
    return user_role


@user_roles_router.put(
    "/{user_id}",
    response_model=UserRole,
    dependencies=[
        authorize(
            scopes=[
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
def update_user_role(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_role_in: UserRoleEdit,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update a users role.
    """
    user_role = UserRoleCrud.get_by_user_id(db, user_id=user_id)
    if not user_role:
        raise HTTPException(
            status_code=404,
            detail="There is no role assigned to this user",
        )
    user_role = UserRoleCrud.edit_item(
        db, id=user_id, values=user_role_in, current_user=current_user.user_id
    )
    return user_role
