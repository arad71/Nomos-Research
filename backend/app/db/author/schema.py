from typing import Optional

from pydantic import BaseModel

from app.db.schemas import TableBase


class AuthorBase(BaseModel):
    author: str
    surname: Optional[str]
    first_names: Optional[str]
    initials: Optional[str]
    orc_id: Optional[str]


class AuthorCreate(AuthorBase):
    pass


class AuthorEdit(AuthorBase):
    pass


class Author(AuthorBase, TableBase):
    author_id: int

    class Config:
        orm_mode = True
