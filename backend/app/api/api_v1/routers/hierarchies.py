from typing import List, Optional

from fastapi import APIRouter, Depends, Response
from starlette.background import BackgroundTasks

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.hierarchy.crud import HierarchyCrud
from app.db.hierarchy.model import rebuild_hierarchy_for_children
from app.db.hierarchy.schema import Hierarchy, HierarchyCreate, HierarchyEdit
from app.db.role.constants import Role
from app.db.session import get_db

hierarchies_router = r = APIRouter(prefix="/hierarchies")


@r.get(
    "",
    response_model=List[Hierarchy],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def hierarchy_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
):
    """
    Get all hierarchies
    """
    hierarchies, content_range = HierarchyCrud.get_items(
        db, range=range, sort=sort, list_filter=filter
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
):
    """
    Get any hierarchy details
    """
    hierarchy = HierarchyCrud.get_item(db, hierarchy_id)
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
    background_tasks: BackgroundTasks,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing hierarchy
    """
    ret = HierarchyCrud.edit_item(db, hierarchy_id, hierarchy, current_user.user_id)
    background_tasks.add_task(rebuild_hierarchy_for_children, hierarchy_id)
    return ret


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
):
    """
    Delete existing hierarchy
    """
    return HierarchyCrud.delete_item(db, hierarchy_id)


@r.post(
    "/rebuild",
    status_code=201,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def hierarchy_rebuild(
    background_tasks: BackgroundTasks,
):
    """
    Rebuild hierarchical indexes
    """
    background_tasks.add_task(HierarchyCrud.rebuild)
    return background_tasks.tasks
