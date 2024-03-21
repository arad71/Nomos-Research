from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, Field

from app.db.conservation_code import enums
from app.db.conservation_code.constants import (
    CONSERVATION_CODE_ID,
    CONSERVATION_CODE_DESCRIPTION,
    AUTHORISING_ORG,
    CODE_PRIORITY,
)
from app.db.schemas import TableBase


class ConservationcodeBase(BaseModel):
    conservation_code_value: str = Field(description=CONSERVATION_CODE_DESCRIPTION)
    authorising_org: str = Field(description=AUTHORISING_ORG)
    code_priority: str = Field(description=CODE_PRIORITY)


class ConservationcodeCreate(ConservationcodeBase):
    pass


class ConservationcodeEdit(ConservationcodeBase):
    pass


class Conservationcode(ConservationcodeBase, TableBase):
    conservation_code_id: int = Field(description=CONSERVATION_CODE_ID)
    deleted: bool

    class Config:
        orm_mode = True
