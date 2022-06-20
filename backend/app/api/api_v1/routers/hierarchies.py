from typing import List, Optional

from fastapi import APIRouter, Depends, Response
from loguru import logger
from sqlalchemy.orm import Session

from app import model
from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.hierarchy.crud import HierarchyCrud
from app.db.hierarchy.schema import (
    Hierarchy,
    HierarchyAncestor,
    HierarchyCreate,
    HierarchyEdit,
)
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
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing hierarchy
    """
    return HierarchyCrud.edit_item(db, hierarchy_id, hierarchy, current_user.user_id)


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


@r.get(
    "/ancestors/{taxon_name_id}",
    response_model=List[HierarchyAncestor],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def hierarchy_ancestors(
    taxon_name_id: int,
    db: Session = Depends(get_db),
):
    current_hierarchy = HierarchyCrud.get_by_property(
        db, "taxon_name_id", taxon_name_id
    )
    logger.debug(current_hierarchy)
    ret = (
        db.query(model.Hierarchy)
        .order_by(model.Hierarchy.path)
        .filter(model.Hierarchy.path.ancestor_of(current_hierarchy.path))
        .all()
    )
    logger.debug(ret)
    return ret
