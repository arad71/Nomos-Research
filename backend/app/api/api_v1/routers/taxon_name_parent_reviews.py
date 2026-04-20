from typing import List, Optional, overload

from fastapi import APIRouter, Depends, Response

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.db.role.constants import Role
from app.db.session import get_db
from app.db.taxon_name_parent_review.crud import TaxonNameParentReviewCrud
from app.db.taxon_name_parent_review.schema import (
    TaxonNameParentReview,
    TaxonNameParentReviewCreate,
    TaxonNameParentReviewEdit,
)
from app.db.user.schema import User

taxon_name_parent_reviews_router = r = APIRouter(prefix="/taxon_name_parent_reviews")


@r.get(
    "",
    response_model=List[TaxonNameParentReview],
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_name_parent_review_list(
    response: Response,
    range: Optional[str] = RangeQueryParameter,
    sort: Optional[str] = None,
    filter: Optional[str] = None,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    rows, content_range = TaxonNameParentReviewCrud.get_items(
        db, current_user, range=range, sort=sort, list_filter=filter
    )
    response.headers["Content-Range"] = content_range
    return rows


@r.get(
    "/{taxon_name_parent_review_id}",
    response_model=TaxonNameParentReview,
    response_model_exclude_none=True,
    dependencies=[
        authorize(
            scopes=[
                Role.MANAGER["name"],
                Role.OFFICER["name"],
                Role.APPLICATION_SUPPORT["name"],
                Role.SUPER_ADMIN["name"],
            ]
        )
    ],
)
async def taxon_name_parent_review_details(
    taxon_name_parent_review_id: int,
    db=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return TaxonNameParentReviewCrud.get_item(
        db, current_user, taxon_name_parent_review_id
    )


@r.post(
    "",
    response_model=TaxonNameParentReview,
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
async def taxon_name_parent_review_create(
    taxon_name_parent_review: TaxonNameParentReviewCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentReviewCrud.create_item(
        db, taxon_name_parent_review, current_user.user_id
    )


@r.put(
    "/{taxon_name_parent_review_id}",
    response_model=TaxonNameParentReview,
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
async def taxon_name_parent_review_edit(
    taxon_name_parent_review_id: int,
    taxon_name_parent_review: TaxonNameParentReviewEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentReviewCrud.edit_item(
        db, current_user, taxon_name_parent_review_id, taxon_name_parent_review
    )


@overload
@r.delete(
    "/{taxon_name_parent_review_id}",
    dependencies=[authorize(scopes=[Role.SUPER_ADMIN["name"], Role.MANAGER["name"]])],
)
async def taxon_name_parent_review_delete(
    taxon_name_parent_review_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentReviewCrud.delete_item(
        db, current_user, taxon_name_parent_review_id
    )


@r.delete(
    "/{taxon_name_parent_review_id}/hard",
    dependencies=[authorize(scopes=[Role.SUPER_ADMIN["name"]])],
)
async def taxon_name_parent_review_delete(
    taxon_name_parent_review_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentReviewCrud.delete_item(
        db, current_user, taxon_name_parent_review_id, True
    )


@r.post(
    "/{taxon_name_parent_review_id}/restore",
    response_model=TaxonNameParentReview,
    response_model_exclude_none=True,
    dependencies=[authorize(scopes=[Role.SUPER_ADMIN["name"]])],
)
async def taxon_name_parent_review_restore(
    taxon_name_parent_review_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return TaxonNameParentReviewCrud.undelete_item(
        db, current_user, taxon_name_parent_review_id
    )
