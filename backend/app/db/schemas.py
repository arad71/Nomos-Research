from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TableBase(BaseModel):
    updated_by: int
    updated_on: Optional[datetime] = None
    created_by: int
    created_on: Optional[datetime] = None

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
    )
