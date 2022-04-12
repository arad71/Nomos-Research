from typing import List, Optional

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import get_current_active_superuser
from app.db.role.crud import RoleCrud
from app.db.role.schema import Role
from app.db.session import get_db

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
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all scopes
    """
    total, roles = RoleCrud.get_items(db, range=range)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{total}"
    return roles
