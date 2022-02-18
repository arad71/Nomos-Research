from pydantic import BaseModel

from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName


class CrossReferenceBase(BaseModel):
    old_name_id: int
    new_name_id: int
    cross_reference_type: str
    active: str
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
