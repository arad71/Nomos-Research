from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser
from app.db.publication.crud import PublicationCrud
from app.db.publication.schema import Publication, PublicationCreate, PublicationEdit
from app.db.session import get_db

publications_router = r = APIRouter(prefix="/publications")


@r.get(
    "",
    response_model=List[Publication],
    response_model_exclude_none=True,
)
async def publication_list(
    response: Response,
    range: str = "[0,10]",
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all publications
    """
    publications = PublicationCrud.get_items(db, range=range)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{PublicationCrud.get_items_count(db)}"
    return publications


@r.get(
    "/{publication_id}",
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
    publication = PublicationCrud.get_item(db, publication_id)
    return publication


@r.post(
    "",
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
    return PublicationCrud.create_item(db, publication, current_user.user_id)


@r.put(
    "/{publication_id}",
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
    return PublicationCrud.edit_item(
        db, publication_id, publication, current_user.user_id
    )


@r.delete(
    "/{publication_id}",
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
    return PublicationCrud.delete_item(db, publication_id)
