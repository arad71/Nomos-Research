from enum import Enum

from pydantic import BaseModel

from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName


class CrossReferenceType(str, Enum):
    ogv = "ogv"
    exc = "exc"
    mis = "mis"
    tsy = "tsy"
    nsy = "nsy"
    con = "con"
    forma = "forma"
    err = "err"
    isy = "isy"


class Active(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class CrossReferenceBase(BaseModel):
    old_name_id: int
    new_name_id: int
    cross_reference_type: CrossReferenceType
    active: Active
    authorised_by: str
    comments: str
    notes: str


class CrossReferenceCreate(CrossReferenceBase):
    pass


class CrossReferenceEdit(CrossReferenceBase):
    pass


class CrossReference(CrossReferenceBase, TableBase):
    cross_reference_id: int
    old_name: TaxonName
    new_name: TaxonName

    class Config:
        orm_mode = True
