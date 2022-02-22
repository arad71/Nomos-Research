from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.db.kingdom.schema import Kingdom
from app.db.schemas import TableBase
from app.db.taxon_name import enums
from app.db.taxon_rank.schema import TaxonRank


class TaxonNameBase(BaseModel):
    kingdom_id: int
    rank_id: int
    rank_name: str
    uninomial: Optional[str]
    phylum: Optional[str]
    # class is a reserved word, will this workaround be enough?
    taxon_class: Optional[str]
    order: Optional[str]
    genus: Optional[str]
    subgenus: Optional[str]
    scientific_name: Optional[str]
    species: Optional[str]
    subspecies: Optional[str]
    specific_epithet: Optional[str]
    infraspecific_epithet: Optional[str]
    publication_id: Optional[int]
    volume_information: Optional[str]
    publication_year: Optional[int]
    is_current: enums.IsCurrent
    origin: Optional[str]
    informal: Optional[str]
    form_desc_yr: Optional[int]
    form_desc_mn: Optional[int]
    form_desc_dy: Optional[int]
    comments: Optional[str]
    contributed_by: Optional[str]
    contributed_on: Optional[datetime]
    validated: enums.Validated
    source: Optional[str]
    external_id: Optional[str]
    family_code: Optional[str]
    author: Optional[str]
    vernacular: Optional[str]
    editor: Optional[str]
    naturalised_status: Optional[enums.NaturalisedStatus]
    naturalised_certainty: Optional[enums.NaturalisedCertainty]
    is_eradicated: Optional[str]
    naturalised_comments: Optional[str]
    linear_sequence: Optional[int]
    family_nid: Optional[int]
    all_vernaculars: Optional[str]
    notes: Optional[str]
    reference: Optional[str]
    authorised_by: Optional[str]
    authorised_on: Optional[datetime]


class TaxonNameCreate(TaxonNameBase):
    pass


class TaxonNameEdit(TaxonNameBase):
    pass


class TaxonName(TaxonNameBase, TableBase):
    taxon_name_id: int
    kingdom: Kingdom
    taxon_rank: TaxonRank

    class Config:
        orm_mode = True
