from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser, get_current_active_user
from app.db.name_id.crud import create_name_id, delete_name_id, edit_name_id, get_name_id, get_name_ids
from app.db.schemas import NameId, NameIdCreate, NameIdEdit
from app.db.session import get_db

name_ids_router = r = APIRouter()


@r.get(
    "/name_ids",
    response_model=List[NameId],
    response_model_exclude_none=True,
)
async def name_id_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all name_ids
    """
    name_ids = get_name_ids(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(name_ids)}"
    return name_ids


@r.get(
    "/name_ids/{name_id_id}",
    response_model=NameId,
    response_model_exclude_none=True,
)
async def name_id_details(
    request: Request,
    name_id_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any name_id details
    """
    name_id = get_name_id(db, name_id_id)
    return name_id


@r.post("/name_ids", response_model=NameId, response_model_exclude_none=True)
async def name_id_create(
    request: Request,
    name_id: NameIdCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new name_id
    """
    return create_name_id(db, name_id)


@r.put(
    "/name_ids/{name_id_id}", response_model=NameId, response_model_exclude_none=True
)
async def name_id_edit(
    request: Request,
    name_id_id: int,
    name_id: NameIdEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing name_id
    """
    return edit_name_id(db, name_id_id, name_id)


@r.delete(
    "/name_ids/{name_id_id}", response_model=NameId, response_model_exclude_none=True
)
async def name_id_delete(
    request: Request,
    name_id_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing name_id
    """
    return delete_name_id(db, name_id_id)
