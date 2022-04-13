from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import get_current_active_superuser
from app.db.cross_reference.crud import CrossReferenceCrud
from app.db.cross_reference.schema import (
    CrossReference,
    CrossReferenceCreate,
    CrossReferenceEdit,
)
from app.db.session import get_db

cross_references_router = r = APIRouter(prefix="/cross_references")


@r.get(
    "",
    response_model=List[CrossReference],
    response_model_exclude_none=True,
)
async def cross_reference_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all cross_references
    """
    cross_references, content_range = CrossReferenceCrud.get_items(
        db, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return cross_references


@r.get(
    "/{cross_reference_id}",
    response_model=CrossReference,
    response_model_exclude_none=True,
)
async def cross_reference_details(
    request: Request,
    cross_reference_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any cross_reference details
    """
    cross_reference = CrossReferenceCrud.get_item(db, cross_reference_id)
    return cross_reference


@r.post(
    "",
    response_model=CrossReference,
    response_model_exclude_none=True,
)
async def cross_reference_create(
    request: Request,
    cross_reference: CrossReferenceCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new cross_reference
    """
    return CrossReferenceCrud.create_item(db, cross_reference, current_user.user_id)


@r.put(
    "/{cross_reference_id}",
    response_model=CrossReference,
    response_model_exclude_none=True,
)
async def cross_reference_edit(
    request: Request,
    cross_reference_id: int,
    cross_reference: CrossReferenceEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing cross_reference
    """
    return CrossReferenceCrud.edit_item(
        db, cross_reference_id, cross_reference, current_user.user_id
    )


@r.delete(
    "/{cross_reference_id}",
    response_model=CrossReference,
    response_model_exclude_none=True,
)
async def cross_reference_delete(
    request: Request,
    cross_reference_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing cross_reference
    """
    return CrossReferenceCrud.delete_item(db, cross_reference_id)
