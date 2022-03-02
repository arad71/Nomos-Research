from pydantic import BaseModel

from app.db.classification_system.schema import ClassificationSystem
from app.db.schemas import TableBase


class InformalGroupBase(BaseModel):
    classification_system_id: int
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
