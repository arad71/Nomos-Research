from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.taxon_name_parent.crud import TaxonNameParentCrud
from app.db.taxon_name_parent.schema import (
    TaxonNameParent,
    TaxonNameParentCreate,
    TaxonNameParentEdit,
)
from app.db.user.schema import User

taxon_name_parents_router = r = APIRouter(prefix="/taxon_name_parents")


@r.get(
    "",
    response_model=List[TaxonNameParent],
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def taxon_name_parent_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    taxon_name_parents, content_range = TaxonNameParentCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    response.headers["Content-Range"] = content_range
    return taxon_name_parents


@r.get(
    "/{taxon_name_parent_id}",
    response_model=TaxonNameParent,
    response_model_exclude_none=True,
    dependencies=[authorize()],
)
async def taxon_name_parent_details(
    taxon_name_parent_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return TaxonNameParentCrud.get_item(db, current_user, taxon_name_parent_id)


@r.post(
    "",
    response_model=TaxonNameParent,
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
async def taxon_name_parent_create(
    taxon_name_parent: TaxonNameParentCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentCrud.create_item(db, taxon_name_parent, current_user.user_id)


@r.put(
    "/{taxon_name_parent_id}",
    response_model=TaxonNameParent,
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
async def taxon_name_parent_edit(
    taxon_name_parent_id: int,
    taxon_name_parent: TaxonNameParentEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentCrud.edit_item(
        db, current_user, taxon_name_parent_id, taxon_name_parent
    )


@overload
@r.delete(
    "/{taxon_name_parent_id}",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
                Role.MANAGER["name"],
            ]
        )
    ],
)
async def taxon_name_parent_delete(
    taxon_name_parent_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentCrud.delete_item(db, current_user, taxon_name_parent_id)


@r.delete(
    "/{taxon_name_parent_id}/hard",
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_name_parent_delete(
    taxon_name_parent_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentCrud.delete_item(db, current_user, taxon_name_parent_id, True)


@r.post(
    "/{taxon_name_parent_id}/restore",
    response_model=TaxonNameParent,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_name_parent_restore(
    taxon_name_parent_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentCrud.undelete_item(db, current_user, taxon_name_parent_id)
