from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser
from app.db.informal_group.crud import (
    create_informal_group,
    delete_informal_group,
    edit_informal_group,
    get_informal_group,
    get_informal_groups,
)
from app.db.informal_group.schema import (
    InformalGroup,
    InformalGroupCreate,
    InformalGroupEdit,
)
from app.db.session import get_db

informal_groups_router = r = APIRouter(prefix="/informal_groups")


@r.get(
    "/",
    response_model=List[InformalGroup],
    response_model_exclude_none=True,
)
async def informal_group_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all informal_groups
    """
    informal_groups = get_informal_groups(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(informal_groups)}"
    return informal_groups


@r.get(
    "/{informal_group_id}",
    response_model=InformalGroup,
    response_model_exclude_none=True,
)
async def informal_group_details(
    request: Request,
    informal_group_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any informal_group details
    """
    informal_group = get_informal_group(db, informal_group_id)
    return informal_group


@r.post(
    "",
    response_model=InformalGroup,
    response_model_exclude_none=True,
)
async def informal_group_create(
    request: Request,
    informal_group: InformalGroupCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new informal_group
    """
    return create_informal_group(db, informal_group, current_user.user_id)


@r.put(
    "/{informal_group_id}",
    response_model=InformalGroup,
    response_model_exclude_none=True,
)
async def informal_group_edit(
    request: Request,
    informal_group_id: int,
    informal_group: InformalGroupEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing informal_group
    """
    return edit_informal_group(
        db, informal_group_id, informal_group, current_user.user_id
    )


@r.delete(
    "/{informal_group_id}",
    response_model=InformalGroup,
    response_model_exclude_none=True,
)
async def informal_group_delete(
    request: Request,
    informal_group_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing informal_group
    """
    return delete_informal_group(db, informal_group_id)
