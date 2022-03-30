from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import get_current_active_superuser
from app.db.session import get_db
from app.db.vernacular.crud import VernacularCrud
from app.db.vernacular.schema import Vernacular, VernacularCreate, VernacularEdit

vernaculars_router = r = APIRouter(prefix="/vernaculars")


@r.get(
    "",
    response_model=List[Vernacular],
    response_model_exclude_none=True,
)
async def vernacular_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all vernaculars
    """
    vernaculars = VernacularCrud.get_items(db, range=range, sort=sort)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{VernacularCrud.get_items_count(db)}"
    return vernaculars


@r.get(
    "/{vernacular_id}",
    response_model=Vernacular,
    response_model_exclude_none=True,
)
async def vernacular_details(
    request: Request,
    vernacular_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any vernacular details
    """
    vernacular = VernacularCrud.get_item(db, vernacular_id)
    return vernacular


@r.post("", response_model=Vernacular, response_model_exclude_none=True)
async def vernacular_create(
    request: Request,
    vernacular: VernacularCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new vernacular
    """
    return VernacularCrud.create_item(db, vernacular, current_user.user_id)


@r.put(
    "/{vernacular_id}",
    response_model=Vernacular,
    response_model_exclude_none=True,
)
async def vernacular_edit(
    request: Request,
    vernacular_id: int,
    vernacular: VernacularEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing vernacular
    """
    return VernacularCrud.edit_item(db, vernacular_id, vernacular, current_user.user_id)


@r.delete(
    "/{vernacular_id}",
    response_model=Vernacular,
    response_model_exclude_none=True,
)
async def vernacular_delete(
    request: Request,
    vernacular_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing vernacular
    """
    return VernacularCrud.delete_item(db, vernacular_id)
