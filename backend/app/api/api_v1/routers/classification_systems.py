from typing import List, Optional

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.classification_system.crud import ClassificationSystemCrud
from app.db.classification_system.schema import (
    ClassificationSystem,
    ClassificationSystemCreate,
    ClassificationSystemEdit,
)
from app.db.role.constants import Role
from app.db.session import get_db

classification_systems_router = r = APIRouter(prefix="/classification_systems")


@r.get(
    "",
    response_model=List[ClassificationSystem],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def classification_system_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
):
    """
    Get all classification_systems
    """

    classification_systems, content_range = ClassificationSystemCrud.get_items(
        db, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return classification_systems


@r.get(
    "/{classification_system_id}",
    response_model=ClassificationSystem,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def classification_system_details(
    classification_system_id: int,
    db=Depends(get_db),
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
    dependencies=[
        authorize(
            scopes=[
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def classification_system_create(
    classification_system: ClassificationSystemCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
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
    dependencies=[
        authorize(
            scopes=[
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def classification_system_edit(
    classification_system_id: int,
    classification_system: ClassificationSystemEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
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
    dependencies=[
        authorize(
            scopes=[
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def classification_system_delete(
    classification_system_id: int,
    db=Depends(get_db),
):
    """
    Delete existing classification_system
    """
    return ClassificationSystemCrud.delete_item(db, classification_system_id)
