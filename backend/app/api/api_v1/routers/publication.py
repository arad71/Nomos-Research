from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser, get_current_active_user
from app.db.publication.crud import (
    create_publication,
    delete_publication,
    edit_publication,
    get_publication,
    get_publications,
)
from app.db.publication.schema import Publication, PublicationCreate, PublicationEdit
from app.db.session import get_db

publications_router = r = APIRouter()


@r.get(
    "/publications",
    response_model=List[Publication],
    response_model_exclude_none=True,
)
async def publication_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all publications
    """
    publications = get_publications(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(publications)}"
    return publications


@r.get(
    "/publications/{publication_id}",
    response_model=Publication,
    response_model_exclude_none=True,
)
async def publication_details(
    request: Request,
    publication_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any publication details
    """
    publication = get_publication(db, publication_id)
    return publication


@r.post(
    "/publications",
    response_model=Publication,
    response_model_exclude_none=True,
)
async def publication_create(
    request: Request,
    publication: PublicationCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new publication
    """
    return create_publication(db, publication)


@r.put(
    "/publications/{publication_id}",
    response_model=Publication,
    response_model_exclude_none=True,
)
async def publication_edit(
    request: Request,
    publication_id: int,
    publication: PublicationEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing publication
    """
    return edit_publication(db, publication_id, publication)


@r.delete(
    "/publications/{publication_id}",
    response_model=Publication,
    response_model_exclude_none=True,
)
async def publication_delete(
    request: Request,
    publication_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing publication
    """
    return delete_publication(db, publication_id)
