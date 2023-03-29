from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TableBase(BaseModel):
    updated_by: int
    updated_on: Optional[datetime]
    created_by: int
    created_on: Optional[datetime]
    deleted_on: Optional[datetime]

    class Config:
        orm_mode = True
