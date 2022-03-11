from typing import Optional

from pydantic import BaseModel, Field

from app.db.classification_system import enums
from app.db.classification_system.constants import *
from app.db.schemas import TableBase


class ClassificationSystemBase(BaseModel):
    class_desc: str = Field(description=DESCRIPTION)
    class_type: enums.ClassificationType = Field(description=CLASS_TYPE)
    preferred: Optional[enums.ClassificationPreferred] = Field(description=PREFERRED)
    sort_order: Optional[int] = Field(description=SORT_ORDER)


class ClassificationSystemCreate(ClassificationSystemBase):
    pass


class ClassificationSystemEdit(ClassificationSystemBase):
    pass


class ClassificationSystem(ClassificationSystemBase, TableBase):
    classification_system_id: int = Field(description=CLASSIFICATION_SYSTEM_ID)

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
