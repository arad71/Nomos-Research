from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy.orm import Session

# from app import crud, models, schemas
from app.core.auth import get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.user.model import User
from app.db.user_role.crud import UserRoleCrud
from app.db.user_role.schema import UserRole, UserRoleCreate, UserRoleUpdate

user_roles_router = APIRouter(prefix="/user-roles", tags=["user-roles"])


@user_roles_router.post("", response_model=UserRole)
def assign_user_role(
    *,
    db: Session = Depends(get_db),
    user_role_in: UserRoleCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Assign a role to a user after creation of a user
    """
    user_role = UserRoleCrud.get_by_user_id(db, user_id=user_role_in.user_id)
    if user_role:
        raise HTTPException(
            status_code=409,
            detail="This user has already been assigned a role.",
        )
    user_role = UserRoleCrud.create_item(db, item=user_role_in)
    return user_role


@user_roles_router.put("/{user_id}", response_model=UserRole)
def update_user_role(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_role_in: UserRoleUpdate,
    current_user: User = Security(
        get_current_active_user,
        scopes=[
            Role.APPLICATION_SUPPORT["name"],
            Role.SUPER_ADMIN["name"],
            Role.OFFICER["name"],
        ],
    ),
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
