from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser
from app.db.kingdom.crud import (
    create_kingdom,
    delete_kingdom,
    edit_kingdom,
    get_kingdom,
    get_kingdoms,
)
from app.db.kingdom.schema import Kingdom, KingdomCreate, KingdomEdit
from app.db.session import get_db

kingdoms_router = r = APIRouter()


@r.get(
    "/kingdoms",
    response_model=List[Kingdom],
    response_model_exclude_none=True,
)
async def kingdom_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all kingdoms
    """
    kingdoms = get_kingdoms(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(kingdoms)}"
    return kingdoms


@r.get(
    "/kingdoms/{kingdom_id}",
    response_model=Kingdom,
    response_model_exclude_none=True,
)
async def kingdom_details(
    request: Request,
    kingdom_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any kingdom details
    """
    kingdom = get_kingdom(db, kingdom_id)
    return kingdom


@r.post("/kingdoms", response_model=Kingdom, response_model_exclude_none=True)
async def kingdom_create(
    request: Request,
    kingdom: KingdomCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new kingdom
    """
    return create_kingdom(db, kingdom)


@r.put(
    "/kingdoms/{kingdom_id}",
    response_model=Kingdom,
    response_model_exclude_none=True,
)
async def kingdom_edit(
    request: Request,
    kingdom_id: int,
    kingdom: KingdomEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing kingdom
    """
    return edit_kingdom(db, kingdom_id, kingdom)


@r.delete(
    "/kingdoms/{kingdom_id}",
    response_model=Kingdom,
    response_model_exclude_none=True,
)
async def kingdom_delete(
    request: Request,
    kingdom_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing kingdom
    """
    return delete_kingdom(db, kingdom_id)
