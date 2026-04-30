from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.db.author.constants import (
    AUTHOR,
    DISCIPLINE,
    EFFECTIVE_FROM,
    EFFECTIVE_TO,
    FIRST_NAMES,
    INITIALS,
    ORC_ID,
    SURNAME,
    TABLE_DESCRIPTION,
)
from app.db.schemas import TableBase


class AuthorBase(BaseModel):
    abbreviation: str = Field(description=AUTHOR)
    surname: Optional[str] = Field(None, description=SURNAME)
    first_names: Optional[str] = Field(None, description=FIRST_NAMES)
    initials: Optional[str] = Field(None, description=INITIALS)
    orc_id: Optional[str] = Field(None, description=ORC_ID)
    discipline: Optional[str] = Field(None, description=DISCIPLINE)
    effective_from: Optional[str] = Field(None, description=EFFECTIVE_FROM)
    effective_to: Optional[str] = Field(None, description=EFFECTIVE_TO)


class AuthorCreate(AuthorBase):
    pass


class AuthorEdit(AuthorBase):
    pass


class Author(AuthorBase, TableBase):
    author_id: int
    full_name: str
    display_name: str
    deleted: bool
    discipline: Optional[str]
    effective_from: Optional[str]
    effective_to: Optional[str]

    # Pydantic v2: use model_config instead of class Config
    model_config = ConfigDict(
        from_attributes=True,  # ← replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},  # ← replaces schema_extra
    )
