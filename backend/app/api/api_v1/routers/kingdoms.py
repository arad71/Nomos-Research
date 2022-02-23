from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser
from app.db.kingdom.crud import KingdomCrud
from app.db.kingdom.schema import Kingdom, KingdomCreate, KingdomEdit
from app.db.session import get_db

kingdoms_router = r = APIRouter(prefix="/kingdoms")


@r.get(
    "",
    response_model=List[Kingdom],
    response_model_exclude_none=True,
)
async def kingdom_list(
    response: Response,
    range: str = "[0,10]",
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all kingdoms
    """
    kingdoms = KingdomCrud.get_items(db, range=range)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(kingdoms)}"
    return kingdoms


@r.get(
    "/{kingdom_id}",
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
    return KingdomCrud.get_item(db, kingdom_id)


@r.post("", response_model=Kingdom, response_model_exclude_none=True)
async def kingdom_create(
    request: Request,
    kingdom: KingdomCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new kingdom
    """
    return KingdomCrud.create_item(db, kingdom, current_user.user_id)


@r.put(
    "/{kingdom_id}",
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
    return KingdomCrud.edit_item(db, kingdom_id, kingdom, current_user.user_id)


@r.delete(
    "/{kingdom_id}",
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
    return KingdomCrud.delete_item(db, kingdom_id)
