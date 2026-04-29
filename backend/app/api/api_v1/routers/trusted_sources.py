from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.trusted_source.crud import TrustedSourceCrud
from app.db.trusted_source.schema import (
    TrustedSource,
    TrustedSourceCreate,
    TrustedSourceEdit,
)
from app.db.user.model import User

trusted_sources_router = r = APIRouter(prefix="/trusted_sources")


@r.get(
    "",
    response_model=List[TrustedSource],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def trusted_source_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get all trusted sources
    """
    trusted_sources, content_range = TrustedSourceCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    # Required for react-admin pagination
    response.headers["Content-Range"] = content_range
    return trusted_sources


@r.get(
    "/{trusted_source_id}",
    response_model=TrustedSource,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def trusted_source_details(
    trusted_source_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Get a single trusted source
    """
    return TrustedSourceCrud.get_item(db, current_user, trusted_source_id)


@r.post(
    "",
    response_model=TrustedSource,
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
async def trusted_source_create(
    trusted_source: TrustedSourceCreate,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new trusted source
    """
    return TrustedSourceCrud.create_item(db, trusted_source, current_user.user_id)


@r.put(
    "/{trusted_source_id}",
    response_model=TrustedSource,
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
async def trusted_source_edit(
    trusted_source_id: int,
    trusted_source: TrustedSourceEdit,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update an existing trusted source
    """
    return TrustedSourceCrud.edit_item(
        db, current_user, trusted_source_id, trusted_source
    )


@overload
@r.delete(
    "/{trusted_source_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def trusted_source_delete(
    trusted_source_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Soft-delete a trusted source
    """
    return TrustedSourceCrud.delete_item(db, current_user, trusted_source_id)


@r.delete(
    "/{trusted_source_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def trusted_source_delete(
    trusted_source_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Hard-delete a trusted source
    """
    return TrustedSourceCrud.delete_item(db, current_user, trusted_source_id, True)


@r.post(
    "/{trusted_source_id}/restore",
    response_model=TrustedSource,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def trusted_source_restore(
    trusted_source_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Restore a soft-deleted trusted source
    """
    return TrustedSourceCrud.undelete_item(db, current_user, trusted_source_id)
