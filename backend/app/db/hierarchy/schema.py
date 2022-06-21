import typing

from pydantic import BaseModel, Field

from app.db.classification_system.schema import ClassificationSystem
from app.db.hierarchy.constants import (
    CLASSIFICATION_SYSTEM_ID,
    PARENT_NAME_ID,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
)
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
    parent_name: TaxonName
    classification_system: ClassificationSystem
    formatted_scientific_name: str
    scientific_name: str
    rank_name: str
    path: typing.Any

    class Config:
        orm_mode = True
        arbitrary_types_allowed = True
        schema_extra = {"description": TABLE_DESCRIPTION}
