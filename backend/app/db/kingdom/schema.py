from typing import Optional

from pydantic import BaseModel, Field

from app.db.kingdom.constants import (
    KINGDOM_DESCRIPTION,
    KINGDOM_ID,
    KINGDOM_NAME,
    TABLE_DESCRIPTION,
)
from app.db.schemas import TableBase


class KingdomBase(BaseModel):
    kingdom_name: str = Field(description=KINGDOM_NAME)
    kingdom_desc: Optional[str] = Field(description=KINGDOM_DESCRIPTION)
    legacy_id: Optional[int]


class KingdomCreate(KingdomBase):
    pass


class KingdomEdit(KingdomBase):
    pass


class Kingdom(KingdomBase, TableBase):
    kingdom_id: int = Field(description=KINGDOM_ID)

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
