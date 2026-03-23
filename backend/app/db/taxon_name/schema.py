from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator
from pydantic.config import ConfigDict

import app.db.taxon_name.constants as constants
from app.db.kingdom.schema import Kingdom
from app.db.schemas import TableBase
from app.db.taxon_name import enums
from app.db.taxon_rank.schema import TaxonRank


class TaxonNameBase(BaseModel):
    kingdom_id: int = Field(description=constants.KINGDOM_ID)
    rank_id: int = Field(description=constants.RANK_ID)
    uninomial: Optional[str] = None
    specific_epithet: Optional[str] = None
    infraspecific_epithet: Optional[str] = None
    is_autonym: Optional[bool] = Field(default=None, description=constants.AUTONYM)

    review: Optional[bool] = Field(default=None, description=constants.REVIEW)
    review_reason: Optional[str] = Field(
        default=None, description=constants.REVIEW_REASON
    )

    publication_id: Optional[int] = Field(
        default=None, description=constants.PUBLICATION_ID
    )
    volume_information: Optional[str] = Field(
        default=None, description=constants.VOLUME_INFORMATION
    )
    is_current: bool = Field(description=constants.IS_CURRENT)
    origin: Optional[str] = Field(default=None, description=constants.ORIGIN)
    publication_status: Optional[enums.PublicationStatus] = None
    form_desc_yr: Optional[int] = Field(
        default=None, description=constants.FORM_DESC_YR
    )
    form_desc_mn: Optional[int] = Field(
        default=None, description=constants.FORM_DESC_MN
    )
    form_desc_dy: Optional[int] = Field(
        default=None, description=constants.FORM_DESC_DY
    )
    comments: Optional[str] = Field(default=None, description=constants.COMMENTS)
    contributed_by: Optional[str] = Field(
        default=None, description=constants.CONTRIBUTED_BY
    )
    contributed_on: Optional[datetime] = Field(
        default=None, description=constants.CONTRIBUTED_ON
    )
    validated: bool = Field(description=constants.VALIDATED)
    source: Optional[str] = Field(default=None, description=constants.SOURCE)
    external_id: Optional[str] = Field(default=None, description=constants.EXTERNAL_ID)
    family_code: Optional[str] = Field(default=None, description=constants.FAMILY_CODE)
    vernacular: Optional[str] = Field(default=None, description=constants.VERNACULAR)
    editor: Optional[str] = None
    naturalised_status: Optional[enums.NaturalisedStatus] = None
    naturalised_certainty: Optional[bool] = None
    is_eradicated: Optional[str] = Field(
        default=None, description=constants.IS_ERADICATED
    )
    naturalised_comments: Optional[str] = Field(
        default=None, description=constants.NATURALISED_COMMENTS
    )
    linear_sequence: Optional[int] = Field(
        default=None, description=constants.LINEAR_SEQUENCE
    )
    family_nid: Optional[int] = Field(default=None, description=constants.FAMILY_NID)
    all_vernaculars: Optional[str] = None
    notes: Optional[str] = None
    reference: Optional[str] = None
    authorised_by: Optional[str] = Field(
        default=None, description=constants.AUTHORISED_BY
    )
    authorised_on: Optional[datetime] = Field(
        default=None, description=constants.AUTTHORISED_ON
    )
    is_wa_recognised: Optional[bool] = Field(
        default=False, description=constants.IS_WA_RECOGNISED
    )
    legacy_id: Optional[str] = Field(default=None, description=constants.LEGACY_ID)
    admin_comment: Optional[str] = None
    classification_system_ids: Optional[list[int]] = None

    # ---- Cross-field validation (Pydantic v2) ----
    @model_validator(mode="after")
    def _validate_autonym(self) -> "TaxonNameBase":
        """
        If `is_autonym` is true, both `specific_epithet` and `infraspecific_epithet`
        must be present and equal.
        """
        if self.is_autonym:
            if not (self.specific_epithet and self.infraspecific_epithet):
                raise ValueError(
                    "If is_autonym is true, specific_epithet and infraspecific_epithet"
                    " must be set and the same"
                )
            if self.specific_epithet != self.infraspecific_epithet:
                raise ValueError(
                    "If is_autonym is true, specific_epithet and infraspecific_epithet"
                    " must be set and the same"
                )
        return self

    @model_validator(mode="after")
    def _validate_review_reason(self) -> "TaxonNameBase":
        """
        If `review` is set truthy, `review_reason` must be provided.
        """
        if self.review and not self.review_reason:
            raise ValueError(
                "If review is set then you need to specify a review reason"
            )
        return self

    # Optional: enable population from ORM objects if you instantiate this base directly
    model_config = ConfigDict(from_attributes=True)


class TaxonNameCreate(TaxonNameBase):
    # Inherit everything from base for creation DTO
    model_config = ConfigDict(from_attributes=True)


class TaxonNameEdit(TaxonNameBase):
    # Inherit everything from base for edit DTO
    model_config = ConfigDict(from_attributes=True)


class TaxonName(TaxonNameBase, TableBase):
    taxon_name_id: int = Field(description=constants.TAXON_NAME_ID)
    kingdom: Kingdom
    taxon_rank: TaxonRank
    canonical_name: Optional[str] = None
    author: Optional[str] = Field(default=None, description=constants.AUTHOR)
    cons_code: Optional[str] = None
    scientific_name: Optional[str] = None
    formatted_scientific_name: Optional[str] = None
    canonical_name_without_rank: Optional[str] = None
    path: Optional[list[str]] = None
    deleted: bool
    infragenus_name: Optional[str] = None
    infragenus_name_with_rank: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": constants.TABLE_DESCRIPTION},
    )


class TaxonNameRow(BaseModel):
    taxon_name_id: int
    uninomial: str
    scientific_name: Optional[str] = None
    specific_epithet: Optional[str] = None
    infraspecific_epithet: Optional[str] = None
    is_autonym: Optional[bool] = None
    author: Optional[str] = None
    cons_code: Optional[str] = None
    rank_name: Optional[str] = None
    rank_abbrev: Optional[str] = None
    parent_nid: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class NameStringComponents(BaseModel):
    uninomial: Optional[str] = None
    specific_epithet: Optional[str] = None
    rank_abbreviation: Optional[str] = None
    infraspecific_epithet: Optional[str] = None
    author: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
