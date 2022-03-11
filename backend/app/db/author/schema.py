from typing import Optional

from pydantic import BaseModel, Field

from app.db.author.constants import *
from app.db.schemas import TableBase


class AuthorBase(BaseModel):
    author: str = Field(description=AUTHOR)
    surname: Optional[str] = Field(description=SURNAME)
    first_names: Optional[str] = Field(description=FIRST_NAMES)
    initials: Optional[str] = Field(description=INITIALS)
    orc_id: Optional[str] = Field(description=ORC_ID)


class AuthorCreate(AuthorBase):
    pass


class AuthorEdit(AuthorBase):
    pass


class Author(AuthorBase, TableBase):
    author_id: int

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
