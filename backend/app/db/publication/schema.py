from app.db.schemas import TableBase


class PublicationBase(TableBase):
    bad_publication: str
    publication: str
    publication_name: str

    pass


class PublicationCreate(PublicationBase):
    pass


class PublicationEdit(PublicationBase):
    pass


class Publication(PublicationBase):
    publication_id: int

    class Config:
        orm_mode = True
