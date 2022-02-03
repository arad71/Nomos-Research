from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser, get_current_active_user
from app.db.conservation_status.crud import create_conservation_status, delete_conservation_status, edit_conservation_status, get_conservation_status, get_conservation_statuss
from app.db.schemas import ConservationStatus, ConservationStatusCreate, ConservationStatusEdit
from app.db.session import get_db

conservation_statuss_router = r = APIRouter()


@r.get(
    "/conservation_statuss",
    response_model=List[ConservationStatus],
    response_model_exclude_none=True,
)
async def conservation_status_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all conservation_statuss
    """
    conservation_statuss = get_conservation_statuss(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(conservation_statuss)}"
    return conservation_statuss


@r.get(
    "/conservation_statuss/{conservation_status_id}",
    response_model=ConservationStatus,
    response_model_exclude_none=True,
)
async def conservation_status_details(
    request: Request,
    conservation_status_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any conservation_status details
    """
    conservation_status = get_conservation_status(db, conservation_status_id)
    return conservation_status


@r.post("/conservation_statuss", response_model=ConservationStatus, response_model_exclude_none=True)
async def conservation_status_create(
    request: Request,
    conservation_status: ConservationStatusCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new conservation_status
    """
    return create_conservation_status(db, conservation_status)


@r.put(
    "/conservation_statuss/{conservation_status_id}", response_model=ConservationStatus, response_model_exclude_none=True
)
async def conservation_status_edit(
    request: Request,
    conservation_status_id: int,
    conservation_status: ConservationStatusEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing conservation_status
    """
    return edit_conservation_status(db, conservation_status_id, conservation_status)


@r.delete(
    "/conservation_statuss/{conservation_status_id}", response_model=ConservationStatus, response_model_exclude_none=True
)
async def conservation_status_delete(
    request: Request,
    conservation_status_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing conservation_status
    """
    return delete_conservation_status(db, conservation_status_id)
