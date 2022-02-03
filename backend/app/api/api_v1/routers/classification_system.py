from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser, get_current_active_user
from app.db.classification_system.crud import create_classification_system, delete_classification_system, edit_classification_system, get_classification_system, get_classification_systems
from app.db.schemas import ClassificationSystem, ClassificationSystemCreate, ClassificationSystemEdit
from app.db.session import get_db

classification_systems_router = r = APIRouter()


@r.get(
    "/classification_systems",
    response_model=List[ClassificationSystem],
    response_model_exclude_none=True,
)
async def classification_system_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all classification_systems
    """
    classification_systems = get_classification_systems(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(classification_systems)}"
    return classification_systems


@r.get(
    "/classification_systems/{classification_system_id}",
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
    classification_system = get_classification_system(db, classification_system_id)
    return classification_system


@r.post("/classification_systems", response_model=ClassificationSystem, response_model_exclude_none=True)
async def classification_system_create(
    request: Request,
    classification_system: ClassificationSystemCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new classification_system
    """
    return create_classification_system(db, classification_system)


@r.put(
    "/classification_systems/{classification_system_id}", response_model=ClassificationSystem, response_model_exclude_none=True
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
    return edit_classification_system(db, classification_system_id, classification_system)


@r.delete(
    "/classification_systems/{classification_system_id}", response_model=ClassificationSystem, response_model_exclude_none=True
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
    return delete_classification_system(db, classification_system_id)
