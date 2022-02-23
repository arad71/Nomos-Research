from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser
from app.db.classification_system.crud import ClassificationSystemCrud
from app.db.classification_system.schema import (
    ClassificationSystem,
    ClassificationSystemCreate,
    ClassificationSystemEdit,
)
from app.db.session import get_db

classification_systems_router = r = APIRouter(prefix="/classification_systems")


@r.get(
    "",
    response_model=List[ClassificationSystem],
    response_model_exclude_none=True,
)
async def classification_system_list(
    response: Response,
    range: str = "[0,10]",
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all classification_systems
    """

    classification_systems = ClassificationSystemCrud.get_items(db, range=range)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(classification_systems)}"
    return classification_systems


@r.get(
    "/{classification_system_id}",
    response_model=ClassificationSystem,
    response_model_exclude_none=True,
)
async def classification_system_details(
    request: Request,
    classification_system_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any classification_system details
    """
    classification_system = ClassificationSystemCrud.get_item(
        db, classification_system_id
    )
    return classification_system


@r.post(
    "",
    response_model=ClassificationSystem,
    response_model_exclude_none=True,
)
async def classification_system_create(
    request: Request,
    classification_system: ClassificationSystemCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new classification_system
    """
    return ClassificationSystemCrud.create_item(
        db, classification_system, current_user.user_id
    )


@r.put(
    "/{classification_system_id}",
    response_model=ClassificationSystem,
    response_model_exclude_none=True,
)
async def classification_system_edit(
    request: Request,
    classification_system_id: int,
    classification_system: ClassificationSystemEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing classification_system
    """
    return ClassificationSystemCrud.edit_item(
        db, classification_system_id, classification_system, current_user.user_id
    )


@r.delete(
    "/{classification_system_id}",
    response_model=ClassificationSystem,
    response_model_exclude_none=True,
)
async def classification_system_delete(
    request: Request,
    classification_system_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing classification_system
    """
    return ClassificationSystemCrud.delete_item(db, classification_system_id)
