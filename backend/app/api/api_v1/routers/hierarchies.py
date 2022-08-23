from typing import List, Optional, overload

from fastapi import APIRouter, BackgroundTasks, Depends, Response
from sqlalchemy.orm import Session
from starlette import status

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.hierarchy.crud import HierarchyCrud
from app.db.hierarchy.schema import (
    Hierarchy,
    HierarchyCreate,
    HierarchyEdit,
    LightweightHierarchy,
)
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.user.schema import User
from app.tools.hierarchy_calculation import rebuild_with_session

hierarchies_router = r = APIRouter(prefix="/hierarchies")


@r.get(
    "",
    response_model=List[Hierarchy],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
@r.get(
    "/parents",
    response_model=List[LightweightHierarchy],
    response_model_exclude_none=True,
    dependencies=[authorize()],
    description=(
        "Duplicate api endpoint to lookup hierarchies. Used in hierarchy form data"
        " consumer"
    ),
)
async def hierarchy_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get all hierarchies
    """
    hierarchies, content_range = HierarchyCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return hierarchies


@r.get(
    "/{hierarchy_id}",
    response_model=Hierarchy,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def hierarchy_details(
    hierarchy_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get any hierarchy details
    """
    hierarchy = HierarchyCrud.get_item(db, current_user, hierarchy_id)
    return hierarchy


@r.post(
    "",
    response_model=Hierarchy,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def hierarchy_create(
    hierarchy: HierarchyCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Create a new hierarchy
    """
    return HierarchyCrud.create_item(db, hierarchy, current_user.user_id)


@r.put(
    "/{hierarchy_id}",
    response_model=Hierarchy,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def hierarchy_edit(
    hierarchy_id: int,
    hierarchy: HierarchyEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing hierarchy
    """
    ret = HierarchyCrud.edit_item(db, current_user, hierarchy_id, hierarchy)
    ret.calculate_path_for_children(db)
    return ret


@overload
@r.delete(
    "/{hierarchy_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def hierarchy_delete(
    hierarchy_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing hierarchy
    """
    return HierarchyCrud.delete_item(db, current_user, hierarchy_id)


@r.delete(
    "/{hierarchy_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def hierarchy_delete(
    hierarchy_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing hierarchy
    """
    return HierarchyCrud.delete_item(db, current_user, hierarchy_id, True)


@r.post(
    "/rebuild",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
def hierarchy_rebuild(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Rebuild hierarchical indexes
    """
    background_tasks.add_task(HierarchyCrud.rebuild, db)
