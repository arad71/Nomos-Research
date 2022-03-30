from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import get_current_active_superuser
from app.db.author.crud import AuthorCrud
from app.db.author.schema import Author, AuthorCreate, AuthorEdit
from app.db.session import get_db

authors_router = r = APIRouter(prefix="/authors")


@r.get(
    "",
    response_model=List[Author],
    response_model_exclude_none=True,
)
async def author_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all authors
    """
    authors = AuthorCrud.get_items(db, range=range, sort=sort)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{AuthorCrud.get_items_count(db)}"
    return authors


@r.get(
    "/{author_id}",
    response_model=Author,
    response_model_exclude_none=True,
)
async def author_details(
    request: Request,
    author_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get any author details
    """
    author = AuthorCrud.get_item(db, author_id)
    return author


@r.post("", response_model=Author, response_model_exclude_none=True)
async def author_create(
    request: Request,
    author: AuthorCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new author
    """
    return AuthorCrud.create_item(db, author, current_user.user_id)


@r.put(
    "/{author_id}",
    response_model=Author,
    response_model_exclude_none=True,
)
async def author_edit(
    request: Request,
    author_id: int,
    author: AuthorEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing author
    """
    return AuthorCrud.edit_item(db, author_id, author, current_user.user_id)


@r.delete(
    "/{author_id}",
    response_model=Author,
    response_model_exclude_none=True,
)
async def author_delete(
    request: Request,
    author_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Delete existing author
    """
    return AuthorCrud.delete_item(db, author_id)
