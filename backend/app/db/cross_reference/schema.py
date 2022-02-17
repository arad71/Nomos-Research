from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.db.schemas import TableBase


class CrossReferenceBase(BaseModel):
    old_name_id: int
    new_name_id: Optional[int]
    cross_reference_type: str
    active: str
    authorised_date: Optional[datetime]
    authorised_by: Optional[str]
    comments: str
    notes: str


class CrossReferenceCreate(CrossReferenceBase):
    pass


class CrossReferenceEdit(CrossReferenceBase):
    pass


class CrossReference(CrossReferenceBase, TableBase):
    cross_reference_id: int

    class Config:
        orm_mode = True
