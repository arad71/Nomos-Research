from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, validator

import app.db.taxon_name.constants as constants
from app.db.kingdom.schema import Kingdom
from app.db.schemas import TableBase
from app.db.taxon_name import enums
from app.db.taxon_rank.schema import TaxonRank


class TaxonNameBase(BaseModel):
    kingdom_id: int = Field(description=constants.KINGDOM_ID)
    rank_id: int = Field(description=constants.RANK_ID)
    uninomial: Optional[str]
    specific_epithet: Optional[str]
    infraspecific_epithet: Optional[str]
    is_autonym: Optional[bool] = Field(description=constants.AUTONYM)

    @validator("is_autonym")
    def validate_autonym(cls, is_autonym, values):
        if "specific_epithet" in values and "infraspecific_epithet" in values:
            if (
                is_autonym
                and values["specific_epithet"]
                and values["specific_epithet"] != values["infraspecific_epithet"]
            ):
                raise ValueError(
                    "If is_autonym is true, specific_epithet and "
                    "infraspecific_epithet must be set and the same"
                )
        return is_autonym

    review: Optional[bool] = Field(description=constants.REVIEW)
    review_reason: Optional[str] = Field(description=constants.REVIEW_REASON)

    @validator("review_reason")
    def validate_review_reason(cls, review_reason, values):
        if "specific_epithet" in values and "infraspecific_epithet" in values:
            if values["review"] and not review_reason:
                raise ValueError(
                    "If review is set then you need to specify a review reason"
                )
        return review_reason

    publication_id: Optional[int] = Field(description=constants.PUBLICATION_ID)
    volume_information: Optional[str] = Field(description=constants.VOLUME_INFORMATION)
    is_current: bool = Field(description=constants.IS_CURRENT)
    origin: Optional[str] = Field(description=constants.ORIGIN)
    publication_status: Optional[enums.PublicationStatus]
    form_desc_yr: Optional[int] = Field(description=constants.FORM_DESC_YR)
    form_desc_mn: Optional[int] = Field(description=constants.FORM_DESC_MN)
    form_desc_dy: Optional[int] = Field(description=constants.FORM_DESC_DY)
    comments: Optional[str] = Field(description=constants.COMMENTS)
    contributed_by: Optional[str] = Field(description=constants.CONTRIBUTED_BY)
    contributed_on: Optional[datetime] = Field(description=constants.CONTRIBUTED_ON)
    validated: bool = Field(description=constants.VALIDATED)
    source: Optional[str] = Field(description=constants.SOURCE)
    external_id: Optional[str] = Field(description=constants.EXTERNAL_ID)
    family_code: Optional[str] = Field(description=constants.FAMILY_CODE)
    vernacular: Optional[str] = Field(description=constants.VERNACULAR)
    editor: Optional[str]
    naturalised_status: Optional[enums.NaturalisedStatus]
    naturalised_certainty: Optional[bool]
    is_eradicated: Optional[str] = Field(description=constants.IS_ERADICATED)
    naturalised_comments: Optional[str] = Field(
        description=constants.NATURALISED_COMMENTS
    )
    linear_sequence: Optional[int] = Field(description=constants.LINEAR_SEQUENCE)
    family_nid: Optional[int] = Field(description=constants.FAMILY_NID)
    all_vernaculars: Optional[str]
    notes: Optional[str]
    reference: Optional[str]
    authorised_by: Optional[str]
    authorised_on: Optional[datetime]
    legacy_id: Optional[str]
    admin_comment: Optional[str]
    classification_system_ids: Optional[list[int]]


class TaxonNameCreate(TaxonNameBase):
    pass


class TaxonNameEdit(TaxonNameBase):
    pass


class TaxonName(TaxonNameBase, TableBase):
    taxon_name_id: int = Field(description=constants.TAXON_NAME_ID)
    kingdom: Kingdom
    taxon_rank: TaxonRank
    canonical_name: Optional[str]
    author: Optional[str] = Field(description=constants.AUTHOR)
    cons_code: Optional[str]
    scientific_name: Optional[str]
    formatted_scientific_name: Optional[str]
    canonical_name_without_rank: Optional[str]
    path: Optional[List[str]]
    deleted: bool
    infragenus_name: Optional[str]
    infragenus_name_with_rank: Optional[str]

    class Config:
        orm_mode = True
        schema_extra = {"description": constants.TABLE_DESCRIPTION}


class TaxonNameRow(BaseModel):
    taxon_name_id: int
    uninomial: str
    scientific_name: Optional[str]
    specific_epithet: Optional[str]
    infraspecific_epithet: Optional[str]
    is_autonym: Optional[bool]
    author: Optional[str]
    cons_code: Optional[str]
    rank_name: Optional[str]
    rank_abbrev: Optional[str]
    parent_nid: Optional[int]


class NameStringComponents(BaseModel):
    uninomial: Optional[str] = None
    specific_epithet: Optional[str] = None
    rank_abbreviation: Optional[str] = None
    infraspecific_epithet: Optional[str] = None
    author: Optional[str] = None
