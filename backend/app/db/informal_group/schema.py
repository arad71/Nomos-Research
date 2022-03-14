from pydantic import BaseModel, Field

from app.db.classification_system.schema import ClassificationSystem
from app.db.informal_group.constants import CLASSIFICATION_SYSTEM_ID, TABLE_DESCRIPTION
from app.db.schemas import TableBase


class InformalGroupBase(BaseModel):
    classification_system_id: int = Field(description=CLASSIFICATION_SYSTEM_ID)
    taxon_name_id: int


class InformalGroupCreate(InformalGroupBase):
    pass


class InformalGroupEdit(InformalGroupBase):
    pass


class InformalGroup(InformalGroupBase, TableBase):
    informal_group_id: int
    classification_system: ClassificationSystem

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
