from pydantic import BaseModel

from app.db.schemas import TableBase


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

    class Config:
        orm_mode = True
