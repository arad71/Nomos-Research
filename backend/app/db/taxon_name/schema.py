from datetime import datetime
from enum import Enum

from pydantic import BaseModel

from app.db.kingdom.schema import Kingdom
from app.db.schemas import TableBase
from app.db.taxon_rank.schema import TaxonRank


class IsCurrent(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class Validated(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class NaturalisedStatus(str, Enum):
    a = "a"
    n = "n"
    m = "m"
    u = "u"


class NaturalisedCertainty(str, Enum):
    y = "y"
    n = "n"


class TaxonNameBase(BaseModel):
    kingdom_id: int
    rank_id: int
    rank_name: str
    uninomial: str
    phylum: str
    # class is a reserved word, will this workaround be enough?
    taxon_class: str
    order: str
    genus: str
    subgenus: str
    scientific_name: str
    species: str
    subspecies: str
    specific_epithet: str
    infraspecific_epithet: str
    publication_id: int
    volume_information: str
    publication_year: int
    is_current: IsCurrent
    origin: str
    informal: str
    form_desc_yr: int
    form_desc_mn: int
    form_desc_dy: int
    comments: str
    contributed_by: str
    contributed_on: datetime
    validated: Validated
    source: str
    external_id: str
    family_code: str
    author: str
    vernacular: str
    editor: str
    naturalised_status: NaturalisedStatus
    naturalised_certainty: NaturalisedCertainty
    is_eradicated: str
    naturalised_comments: str
    linear_sequence: int
    family_nid: int
    all_vernaculars: str
    notes: str
    reference: str
    authorised_by: str
    authorised_on: datetime


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
