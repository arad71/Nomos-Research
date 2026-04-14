from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.taxon_publication.crud import TaxonPublicationCrud
from app.db.taxon_publication.schema import (
    TaxonPublication,
    TaxonPublicationCreate,
    TaxonPublicationEdit,
)
from app.db.user.schema import User

taxon_publications_router = r = APIRouter(prefix="/taxon-publications")


@r.get(
    "",
    response_model=List[TaxonPublication],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def taxon_publication_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get taxon-publication links
    """
    items, content_range = TaxonPublicationCrud.get_items(
        db,
        current_user,
        range=range,
        sort=sort,
        list_filter=filter,
    )

    # Required for react-admin
    response.headers["Content-Range"] = content_range
    return items


@r.get(
    "/{link_id}",
    response_model=TaxonPublication,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def taxon_publication_details(
    link_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get taxon-publication link details
    """
    return TaxonPublicationCrud.get_item(db, current_user, link_id)


@r.post(
    "",
    response_model=TaxonPublication,
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
async def taxon_publication_create(
    payload: TaxonPublicationCreate,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a taxon-publication link
    """
    return TaxonPublicationCrud.create_item(
        db,
        payload,
        current_user.user_id,
    )


@r.put(
    "/{link_id}",
    response_model=TaxonPublication,
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
async def taxon_publication_edit(
    link_id: int,
    payload: TaxonPublicationEdit,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update taxon-publication citation context
    """
    return TaxonPublicationCrud.edit_item(
        db,
        current_user,
        link_id,
        payload,
    )


@overload
@r.delete(
    "/{link_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def taxon_publication_delete(
    link_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Soft delete taxon-publication link
    """
    return TaxonPublicationCrud.delete_item(db, current_user, link_id)


@r.delete(
    "/{link_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_publication_delete(
    link_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Hard delete taxon-publication link
    """
    return TaxonPublicationCrud.delete_item(db, current_user, link_id, True)


@r.post(
    "/{link_id}/restore",
    response_model=TaxonPublication,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_publication_restore(
    link_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Restore a soft-deleted taxon-publication link
    """
    return TaxonPublicationCrud.undelete_item(db, current_user, link_id)
