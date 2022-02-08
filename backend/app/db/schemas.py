from datetime import datetime

from pydantic import BaseModel

class TableBase(BaseModel):
    updated_by: int
    updated_on: datetime
    created_by: int
    created_on: datetime

    class Config:
        orm_mode = True
