from typing import List

from fastapi import APIRouter, Depends, Request, Response

from app.core.auth import get_current_active_superuser, get_current_active_user
from app.db.author.crud import create_author, delete_author, edit_author, get_author, get_authors
from app.db.schemas import Author, AuthorCreate, AuthorEdit
from app.db.session import get_db

authors_router = r = APIRouter()


@r.get(
    "/authors",
    response_model=List[Author],
    response_model_exclude_none=True,
)
async def author_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all authors
    """
    authors = get_authors(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(authors)}"
    return authors


@r.get(
    "/authors/{author_id}",
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
    author = get_author(db, author_id)
    return author


@r.post("/authors", response_model=Author, response_model_exclude_none=True)
async def author_create(
    request: Request,
    author: AuthorCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Create a new author
    """
    return create_author(db, author)


@r.put(
    "/authors/{author_id}", response_model=Author, response_model_exclude_none=True
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
    return edit_author(db, author_id, author)


@r.delete(
    "/authors/{author_id}", response_model=Author, response_model_exclude_none=True
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
    return delete_author(db, author_id)
