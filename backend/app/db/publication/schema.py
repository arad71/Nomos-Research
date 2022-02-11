from pydantic import BaseModel

from app.db.schemas import TableBase


class PublicationBase(BaseModel):
    bad_publication: str
    publication: str
    publication_name: str

    pass


class PublicationCreate(PublicationBase):
    pass


class PublicationEdit(PublicationBase):
    pass


class Publication(PublicationBase, TableBase):
    publication_id: int

    class Config:
        orm_mode = True
