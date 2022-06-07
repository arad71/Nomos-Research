from typing import List, Optional

from fastapi import APIRouter, Depends, Response
from starlette import status

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.informal_group.crud import InformalGroupCrud
from app.db.informal_group.schema import (
    InformalGroup,
    InformalGroupCreate,
    InformalGroupEdit,
)
from app.db.role.constants import Role
from app.db.session import get_db

informal_groups_router = r = APIRouter(prefix="/informal_groups")


@r.get(
    "",
    response_model=List[InformalGroup],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def informal_group_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
):
    """
    Get all informal_groups
    """
    informal_groups, content_range = InformalGroupCrud.get_items(
        db, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return informal_groups


@r.get(
    "/{informal_group_id}",
    response_model=InformalGroup,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def informal_group_details(
    informal_group_id: int,
    db=Depends(get_db),
):
    """
    Get any informal_group details
    """
    informal_group = InformalGroupCrud.get_item(db, informal_group_id)
    return informal_group


@r.post(
    "",
    response_model=InformalGroup,
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
async def informal_group_create(
    informal_group: InformalGroupCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Create a new informal_group
    """
    return InformalGroupCrud.create_item(db, informal_group, current_user.user_id)


@r.put(
    "/{informal_group_id}",
    response_model=InformalGroup,
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
async def informal_group_edit(
    informal_group_id: int,
    informal_group: InformalGroupEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing informal_group
    """
    return InformalGroupCrud.edit_item(
        db, informal_group_id, informal_group, current_user.user_id
    )


@r.delete(
    "/{informal_group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def informal_group_delete(
    informal_group_id: int,
    db=Depends(get_db),
):
    """
    Delete existing informal_group
    """
    return InformalGroupCrud.delete_item(db, informal_group_id)
