import typing as t
from datetime import datetime

from app.db.schemas import TableBase


# ClassificationSystem
class ClassificationSystemBase(TableBase):
    class_desc: str
    class_type: str
    preferred: str
    sort_order: int


class ClassificationSystemCreate(ClassificationSystemBase):
    pass


class ClassificationSystemEdit(ClassificationSystemBase):
    pass


class ClassificationSystem(ClassificationSystemBase):
    classification_system_id: str

    class Config:
        orm_mode = True
