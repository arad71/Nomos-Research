from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.conservation_code.crud import ConservationcodeCrud
from app.db.conservation_code.schema import Conservationcode, ConservationcodeCreate, ConservationcodeEdit
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.user.schema import User

conservation_codes_router = r = APIRouter(prefix="/conservation_codes")


@r.get(
    "",
    response_model=List[Conservationcode],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def Conservation_code_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get all codes
    """
    Conservationcode, content_range = ConservationcodeCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return Conservationcode


@r.get(
    "/{conservation_code_id}",
    response_model=Conservationcode,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def Conservation_code_details(
    conservation_code_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get any  details
    """
    conservationcode = ConservationcodeCrud.get_item(db, current_user, conservation_code_id)
    return conservationcode


@r.post(
    "",
    response_model=Conservationcode,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def Conservation_code_create(
    conservationcode: ConservationcodeCreate,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new code
    """
    return ConservationcodeCrud.create_item(
        db, conservationcode, current_user=current_user.user_id
    )


@r.put(
    "/{conservation_code_id}",
    response_model=Conservationcode,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def Conservation_code_edit(
    conservation_code_id: int,
    conservationcode: ConservationcodeEdit,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update existing code
    """
    return ConservationcodeCrud.edit_item(db, current_user, conservation_code_id, conservationcode)


@overload
@r.delete(
    "/{conservation_code_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def Conservation_code_delete(
    conservation_code_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete existing code
    """
    return ConservationcodeCrud.delete_item(db, current_user, conservation_code_id)


@r.delete(
    "/{conservation_code_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def Conservation_code_delete(
    conservation_code_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete existing code
    """
    return ConservationcodeCrud.delete_item(db, current_user, conservation_code_id, True)
