from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser, get_current_active_user
from app.db.cross_reference.crud import create_cross_reference, delete_cross_reference, edit_cross_reference, get_cross_reference, get_cross_references
from app.db.schemas import CrossReference, CrossReferenceCreate, CrossReferenceEdit
from app.db.session import get_db

cross_references_router = r = APIRouter()


@r.get(
    "/cross_references",
    response_model=List[CrossReference],
    response_model_exclude_none=True,
)
async def cross_reference_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all cross_references
    """
    cross_references = get_cross_references(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(cross_references)}"
    return cross_references


@r.get(
    "/cross_references/{cross_reference_id}",
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
    cross_reference = get_cross_reference(db, cross_reference_id)
    return cross_reference


@r.post("/cross_references", response_model=CrossReference, response_model_exclude_none=True)
async def cross_reference_create(
    request: Request,
    cross_reference: CrossReferenceCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new cross_reference
    """
    return create_cross_reference(db, cross_reference)


@r.put(
    "/cross_references/{cross_reference_id}", response_model=CrossReference, response_model_exclude_none=True
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
    return edit_cross_reference(db, cross_reference_id, cross_reference)


@r.delete(
    "/cross_references/{cross_reference_id}", response_model=CrossReference, response_model_exclude_none=True
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
    return delete_cross_reference(db, cross_reference_id)
