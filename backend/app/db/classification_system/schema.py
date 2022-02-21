from enum import Enum

from pydantic import BaseModel

from app.db.schemas import TableBase


class ClassificationType(str, Enum):
    informal = "informal"
    hierarchical = "hierarchical"


class ClassificationPreferred(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class ClassificationSystemBase(BaseModel):
    class_desc: str
    class_type: ClassificationType
    preferred: ClassificationPreferred
    sort_order: int


class ClassificationSystemCreate(ClassificationSystemBase):
    pass


class ClassificationSystemEdit(ClassificationSystemBase):
    pass


class ClassificationSystem(ClassificationSystemBase, TableBase):
    classification_system_id: int

    class Config:
        orm_mode = True
