from enum import Enum

from app.db.author.schema import Author
from app.db.schemas import TableBase


class AuthorType(str, Enum):
    basionym = "basionym"
    current = "current"
    editor = "editor"


class CitationBase(TableBase):
    taxon_name_id: int
    author_id: int
    author_type: AuthorType
    author_order: int


class CitationCreate(CitationBase):
    pass


class CitationEdit(CitationBase):
    pass


class Citation(CitationBase):
    citation_id: int
    author: Author

    class Config:
        orm_mode = True
