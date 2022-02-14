from typing import List
from app.db.schemas import TableBase


class AuthorBase(TableBase):
    author: str
    surname: str
    first_names: str
    initials: str
    orc_id: int


class AuthorCreate(AuthorBase):
    pass


class AuthorEdit(AuthorBase):
    pass


class Author(AuthorBase):
    author_id: int

    class Config:
        orm_mode = True

