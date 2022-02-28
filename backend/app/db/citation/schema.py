from pydantic import BaseModel

from app.db.author.schema import Author
from app.db.citation import enums
from app.db.schemas import TableBase


class CitationBase(BaseModel):
    taxon_name_id: int
    author_id: int
    author_type: enums.AuthorType
    author_order: int


class CitationCreate(CitationBase):
    pass


class CitationEdit(CitationBase):
    pass


class Citation(CitationBase, TableBase):
    citation_id: int
    author: Author

    class Config:
        orm_mode = True
