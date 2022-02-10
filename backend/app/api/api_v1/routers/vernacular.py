from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser
from app.db.session import get_db
from app.db.vernacular.crud import (
    create_vernacular,
    delete_vernacular,
    edit_vernacular,
    get_vernacular,
    get_vernaculars,
)
from app.db.vernacular.schema import Vernacular, VernacularCreate, VernacularEdit

vernaculars_router = r = APIRouter(prefix="/vernacular")


@r.get(
    "/",
    response_model=List[Vernacular],
    response_model_exclude_none=True,
)
async def vernacular_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all vernacular
    """
    vernacular = get_vernaculars(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(vernacular)}"
    return vernacular


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
    vernacular = get_vernacular(db, vernacular_id)
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
    return create_vernacular(db, vernacular)


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
    return edit_vernacular(db, vernacular_id, vernacular)


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
    return delete_vernacular(db, vernacular_id)
