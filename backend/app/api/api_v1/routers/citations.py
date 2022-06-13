from typing import List, Optional

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.citation.crud import CitationCrud
from app.db.citation.schema import Citation, CitationCreate, CitationEdit
from app.db.role.constants import Role
from app.db.session import get_db

citations_router = r = APIRouter(prefix="/citations")


@r.get(
    "",
    response_model=List[Citation],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def citation_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
):
    """
    Get all citations
    """
    citations, content_range = CitationCrud.get_items(
        db, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return citations


@r.get(
    "/{citation_id}",
    response_model=Citation,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def citation_details(
    citation_id: int,
    db=Depends(get_db),
):
    """
    Get any citation details
    """
    citation = CitationCrud.get_item(db, citation_id)
    return citation


@r.post(
    "",
    response_model=Citation,
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
async def citation_create(
    citation: CitationCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Create a new citation
    """
    return CitationCrud.create_item(db, citation, current_user.user_id)


@r.put(
    "/{citation_id}",
    response_model=Citation,
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
async def citation_edit(
    citation_id: int,
    citation: CitationEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing citation
    """
    return CitationCrud.edit_item(db, citation_id, citation, current_user.user_id)


@r.delete(
    "/{citation_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def citation_delete(
    citation_id: int,
    db=Depends(get_db),
):
    """
    Delete existing citation
    """
    return CitationCrud.delete_item(db, citation_id)
