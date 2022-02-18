from pydantic import BaseModel


from app.db.schemas import TableBase


class AuthorBase(BaseModel):
    author: str
    surname: str
    first_names: str
    initials: str
    orc_id: int


class AuthorCreate(AuthorBase):
    pass


class AuthorEdit(AuthorBase):
    pass


class Author(AuthorBase, TableBase):
    author_id: int


    class Config:
        orm_mode = True
