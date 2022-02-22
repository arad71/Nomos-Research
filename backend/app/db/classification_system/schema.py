from typing import Optional

from pydantic import BaseModel

from app.db.schemas import TableBase


class ClassificationSystemBase(BaseModel):
    class_desc: str
    class_type: str
    preferred: Optional[str]
    sort_order: Optional[int]


class ClassificationSystemCreate(ClassificationSystemBase):
    pass


class ClassificationSystemEdit(ClassificationSystemBase):
    pass


class ClassificationSystem(ClassificationSystemBase, TableBase):
    classification_system_id: int

    class Config:
        orm_mode = True
