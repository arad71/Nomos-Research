from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.author.crud import AuthorCrud
from app.db.author.schema import Author, AuthorCreate, AuthorEdit
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.user.schema import User

authors_router = r = APIRouter(prefix="/authors")


@r.get(
    "",
    response_model=List[Author],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def author_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get all authors
    """
    authors, content_range = AuthorCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = content_range
    return authors


@r.get(
    "/{author_id}",
    response_model=Author,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def author_details(
    author_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get any author details
    """
    author = AuthorCrud.get_item(db, current_user, author_id)
    return author


@r.post(
    "",
    response_model=Author,
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
async def author_create(
    author: AuthorCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Create a new author
    """
    return AuthorCrud.create_item(db, author, current_user.user_id)


@r.put(
    "/{author_id}",
    response_model=Author,
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
async def author_edit(
    author_id: int,
    author: AuthorEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Update existing author
    """
    return AuthorCrud.edit_item(db, current_user, author_id, author)


@overload
@r.delete(
    "/{author_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def author_delete(
    author_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing author
    """
    return AuthorCrud.delete_item(db, current_user, author_id)


@r.delete(
    "/{author_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def author_delete(
    author_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Delete existing author
    """
    return AuthorCrud.delete_item(db, current_user, author_id, True)
