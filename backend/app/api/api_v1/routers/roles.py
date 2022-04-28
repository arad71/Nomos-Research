from typing import List, Optional

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import get_current_active_user
from app.db.role.crud import RoleCrud
from app.db.role.schema import Role
from app.db.session import get_db
from app.db.user.model import User

roles_router = r = APIRouter(prefix="/roles")


@r.get(
    "",
    response_model=List[Role],
    response_model_exclude_none=True,
)
async def role_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get all scopes
    """
    roles, content_range = RoleCrud.get_items(db, range=range)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return roles


@r.get(
    "/{role_id}",
    response_model=Role,
    response_model_exclude_none=True,
)
async def role_details(
    role_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get any role details
    """
    role = RoleCrud.get_item(db, role_id)
    return role
