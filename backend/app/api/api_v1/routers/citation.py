from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser
from app.db.citation.crud import (
    create_citation,
    delete_citation,
    edit_citation,
    get_citation,
    get_citations,
)
from app.db.citation.schema import Citation, CitationCreate, CitationEdit
from app.db.session import get_db

citations_router = r = APIRouter(prefix="/citations")


@r.get(
    "",
    response_model=List[Citation],
    response_model_exclude_none=True,
)
async def citation_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all citations
    """
    citations = get_citations(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(citations)}"
    return citations


@r.get(
    "/{citation_id}",
    response_model=Citation,
    response_model_exclude_none=True,
)
async def citation_details(
    request: Request,
    citation_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any citation details
    """
    citation = get_citation(db, citation_id)
    return citation


@r.post(
    "",
    response_model=Citation,
    response_model_exclude_none=True,
)
async def citation_create(
    request: Request,
    citation: CitationCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new citation
    """
    return create_citation(db, citation, current_user.user_id)


@r.put(
    "/{citation_id}",
    response_model=Citation,
    response_model_exclude_none=True,
)
async def citation_edit(
    request: Request,
    citation_id: int,
    citation: CitationEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing citation
    """
    return edit_citation(db, citation_id, citation, current_user.user_id)


@r.delete(
    "/{citation_id}",
    response_model=Citation,
    response_model_exclude_none=True,
)
async def citation_delete(
    request: Request,
    citation_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing citation
    """
    return delete_citation(db, citation_id)
