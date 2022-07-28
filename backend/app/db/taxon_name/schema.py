from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.db.kingdom.schema import Kingdom
from app.db.schemas import TableBase
from app.db.taxon_name import enums
from app.db.taxon_name.constants import (
    AUTHOR,
    COMMENTS,
    CONTRIBUTED_BY,
    CONTRIBUTED_ON,
    EXTERNAL_ID,
    FAMILY_CODE,
    FAMILY_NID,
    FORM_DESC_DY,
    FORM_DESC_MN,
    FORM_DESC_YR,
    IS_CURRENT,
    IS_ERADICATED,
    KINGDOM_ID,
    LINEAR_SEQUENCE,
    NATURALISED_COMMENTS,
    ORIGIN,
    PUBLICATION_ID,
    RANK_ID,
    SOURCE,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
    VALIDATED,
    VERNACULAR,
    VOLUME_INFORMATION,
)
from app.db.taxon_rank.schema import TaxonRank


class TaxonNameBase(BaseModel):
    kingdom_id: int = Field(description=KINGDOM_ID)
    rank_id: int = Field(description=RANK_ID)
    phylum: Optional[str]
    # class is a reserved word, will this workaround be enough?
    taxon_class: Optional[str]
    order: Optional[str]
    family: Optional[str]
    genus: Optional[str]
    subgenus: Optional[str]
    species: Optional[str]
    subspecies: Optional[str]
    uninomial: Optional[str]
    specific_epithet: Optional[str]
    infraspecific_epithet: Optional[str]
    publication_id: Optional[int] = Field(description=PUBLICATION_ID)
    volume_information: Optional[str] = Field(description=VOLUME_INFORMATION)
    is_current: bool = Field(description=IS_CURRENT)
    origin: Optional[str] = Field(description=ORIGIN)
    publication_status: Optional[enums.PublicationStatus]
    form_desc_yr: Optional[int] = Field(description=FORM_DESC_YR)
    form_desc_mn: Optional[int] = Field(description=FORM_DESC_MN)
    form_desc_dy: Optional[int] = Field(description=FORM_DESC_DY)
    comments: Optional[str] = Field(description=COMMENTS)
    contributed_by: Optional[str] = Field(description=CONTRIBUTED_BY)
    contributed_on: Optional[datetime] = Field(description=CONTRIBUTED_ON)
    validated: bool = Field(description=VALIDATED)
    source: Optional[str] = Field(description=SOURCE)
    external_id: Optional[str] = Field(description=EXTERNAL_ID)
    family_code: Optional[str] = Field(description=FAMILY_CODE)
    vernacular: Optional[str] = Field(description=VERNACULAR)
    editor: Optional[str]
    naturalised_status: Optional[enums.NaturalisedStatus]
    naturalised_certainty: Optional[bool]
    is_eradicated: Optional[str] = Field(description=IS_ERADICATED)
    naturalised_comments: Optional[str] = Field(description=NATURALISED_COMMENTS)
    linear_sequence: Optional[int] = Field(description=LINEAR_SEQUENCE)
    family_nid: Optional[int] = Field(description=FAMILY_NID)
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
    taxon_name_id: int = Field(description=TAXON_NAME_ID)
    kingdom: Kingdom
    taxon_rank: TaxonRank
    canonical_name: Optional[str]
    author: Optional[str] = Field(description=AUTHOR)
    scientific_name: Optional[str]
    formatted_scientific_name: Optional[str]
    canonical_name_without_rank: Optional[str]
    path: Optional[List[str]]

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
