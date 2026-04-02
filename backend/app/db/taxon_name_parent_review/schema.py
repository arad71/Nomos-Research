from datetime import datetime

from pydantic import ConfigDict, Field

from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName
from app.db.taxon_name_parent_review import constants


class TaxonNameParentReviewBase(TableBase):
    taxon_name_id: int = Field(description=constants.TAXON_NAME_ID)
    status: str = Field(description=constants.STATUS)
    reason: str | None = Field(default=None, description=constants.REASON)
    legacy_uninomial: str | None = Field(default=None, description=constants.LEGACY_UNINOMIAL)
    derived_uninomial: str | None = Field(default=None, description=constants.DERIVED_UNINOMIAL)
    candidate_parent_ids: str | None = Field(default=None, description=constants.CANDIDATE_PARENT_IDS)
    candidate_parent_names: str | None = Field(default=None, description=constants.CANDIDATE_PARENT_NAMES)
    parent_count: int | None = Field(default=None, description=constants.PARENT_COUNT)
    hybrid_category: str | None = Field(default=None, description=constants.HYBRID_CATEGORY)
    review_notes: str | None = Field(default=None, description=constants.REVIEW_NOTES)
    reviewed_by: int | None = Field(default=None, description=constants.REVIEWED_BY)
    reviewed_on: datetime | None = Field(default=None, description=constants.REVIEWED_ON)


class TaxonNameParentReviewCreate(TaxonNameParentReviewBase):
    pass


class TaxonNameParentReviewEdit(TaxonNameParentReviewBase):
    pass


class TaxonNameParentReview(TaxonNameParentReviewBase):
    taxon_name_parent_review_id: int = Field(description=constants.TAXON_NAME_PARENT_REVIEW_ID)
    taxon_name: TaxonName
    deleted: bool

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={"description": constants.TABLE_DESCRIPTION},
    )
