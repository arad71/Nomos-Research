import typing as t
from datetime import datetime

from app.db.schemas import TableBase


class HierarchyBase(TableBase):
    name_id: int
    classification_id: str
    parent_nid: int
    pass


class HierarchyCreate(HierarchyBase):
    pass


class HierarchyEdit(HierarchyBase):
    pass


class Hierarchy(HierarchyBase):
    hierarchy_id: int

    class Config:
        orm_mode = True
