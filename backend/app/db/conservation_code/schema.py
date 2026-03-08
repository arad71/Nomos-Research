# from datetime import date, datetime
# from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

# from app.db.conservation_code import enums
from app.db.conservation_code.constants import (
    AUTHORISING_ORG,
    CODE_PRIORITY,
    CONSERVATION_CODE_DESCRIPTION,
    CONSERVATION_CODE_ID,
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

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        # json_schema_extra={"description": TABLE_DESCRIPTION},
    )
