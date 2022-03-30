from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import get_current_active_superuser
from app.db.hierarchy.crud import HierarchyCrud
from app.db.hierarchy.schema import Hierarchy, HierarchyCreate, HierarchyEdit
from app.db.session import get_db

hierarchies_router = r = APIRouter(prefix="/hierarchies")


@r.get(
    "",
    response_model=List[Hierarchy],
    response_model_exclude_none=True,
)
async def hierarchy_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all hierarchies
    """
    hierarchies = HierarchyCrud.get_items(db, range=range, sort=sort)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{HierarchyCrud.get_items_count(db)}"
    return hierarchies


@r.get(
    "/{hierarchy_id}",
    response_model=Hierarchy,
    response_model_exclude_none=True,
)
async def hierarchy_details(
    request: Request,
    hierarchy_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any hierarchy details
    """
    hierarchy = HierarchyCrud.get_item(db, hierarchy_id)
    return hierarchy


@r.post("", response_model=Hierarchy, response_model_exclude_none=True)
async def hierarchy_create(
    request: Request,
    hierarchy: HierarchyCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new hierarchy
    """
    return HierarchyCrud.create_item(db, hierarchy, current_user.user_id)


@r.put(
    "/{hierarchy_id}",
    response_model=Hierarchy,
    response_model_exclude_none=True,
)
async def hierarchy_edit(
    request: Request,
    hierarchy_id: int,
    hierarchy: HierarchyEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing hierarchy
    """
    return HierarchyCrud.edit_item(db, hierarchy_id, hierarchy, current_user.user_id)


@r.delete(
    "/{hierarchy_id}",
    response_model=Hierarchy,
    response_model_exclude_none=True,
)
async def hierarchy_delete(
    request: Request,
    hierarchy_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing hierarchy
    """
    return HierarchyCrud.delete_item(db, hierarchy_id)
