from pydantic import BaseModel, Field

from app.db.classification_system.schema import ClassificationSystem
from app.db.hierarchy.constants import *
from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName


class HierarchyBase(BaseModel):
    taxon_name_id: int = Field(description=TAXON_NAME_ID)
    classification_system_id: int = Field(description=CLASSIFICATION_SYSTEM_ID)
    parent_nid: int = Field(description=PARENT_NAME_ID)
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
        schema_extra = {"description": TABLE_DESCRIPTION}
