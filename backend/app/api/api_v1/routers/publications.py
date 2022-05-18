from typing import List, Optional

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.publication.crud import PublicationCrud
from app.db.publication.schema import Publication, PublicationCreate, PublicationEdit
from app.db.role.constants import Role
from app.db.session import get_db

publications_router = r = APIRouter(prefix="/publications")


@r.get(
    "",
    response_model=List[Publication],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def publication_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
):
    """
    Get all publications
    """
    publications, content_range = PublicationCrud.get_items(
        db, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return publications


@r.get(
    "/{publication_id}",
    response_model=Publication,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def publication_details(
    publication_id: int,
    db=Depends(get_db),
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
async def publication_create(
    publication: PublicationCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Create a new publication
    """
    return PublicationCrud.create_item(db, publication, current_user.user_id)


@r.put(
    "/{publication_id}",
    response_model=Publication,
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
async def publication_edit(
    publication_id: int,
    publication: PublicationEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
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
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def publication_delete(
    publication_id: int,
    db=Depends(get_db),
):
    """
    Delete existing publication
    """
    return PublicationCrud.delete_item(db, publication_id)
