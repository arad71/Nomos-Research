from pydantic import BaseModel

from app.db.classification_system.schema import ClassificationSystem
from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName


class HierarchyBase(BaseModel):
    taxon_name_id: int
    classification_system_id: int
    parent_nid: int
    pass


class HierarchyCreate(HierarchyBase):
    pass


class HierarchyEdit(HierarchyBase):
    pass


class Hierarchy(HierarchyBase, TableBase):
    hierarchy_id: int
    taxon_name: TaxonName
    parent: TaxonName
    classification_system: ClassificationSystem

    class Config:
        orm_mode = True
