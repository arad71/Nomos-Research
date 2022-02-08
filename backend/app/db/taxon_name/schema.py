import typing as t
from datetime import datetime

from app.db.schemas import TableBase


class TaxonNameBase(TableBase):
    kingdom_id: int
    rank_id: int
    rank_name: str
    uninomial: str
    kingdom: str
    phylum: str
    # class is a reserved word, will this workaround be enough?
    taxon_class: str
    order: str
    family: str
    genus: str
    subgenus: str
    scientific_name: str
    species: str
    subspecies: str
    taxon_rank: str
    specific_epithet: str
    infraspecific_epithet: str
    publication_id: int
    volume_information: str
    publication_year: int
    is_current: str
    origin: str
    informal: str
    form_desc_yr: int
    form_desc_mn: int
    form_desc_dy: int
    comments: str
    contributed_by: str
    contributed_on: datetime
    validated: str
    source: str
    external_id: str
    family_code: str
    author: str
    vernacular: str
    editor: str
    naturalised_status: str
    naturalised_certainty: str
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


class TaxonName(TaxonNameBase):
    name_id: int

    class Config:
        orm_mode = True
