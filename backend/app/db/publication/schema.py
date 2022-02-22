from enum import Enum
from typing import Optional

from pydantic import BaseModel

from app.db.author.schema import Author
from app.db.schemas import TableBase


class BadPublication(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class PublicationBase(BaseModel):
    bad_publication: Optional[BadPublication]
    publication: Optional[str]
    publication_name: str
    doi: str
    title: str
    display_title: str
    abbreviated_title: str
    year: int
    volume: str
    edition: str
    pages: str
    verbatim_reference: str
    verbatim_citation: str
    verbatim_author: str
    citation: str
    citation_html: str
    citation_author_year: str
    notes: str
    published: bool
    publisher: str
    published_location: str
    publication_date: str
    isbn: str
    issn: str
    bhl_url: str
    tl2: str
    reference_type: str
    parent: int
    reference_author_role: str
    language: str
    duplicate_of: int
    pass


class PublicationCreate(PublicationBase):
    pass


class PublicationEdit(PublicationBase):
    pass


class Publication(PublicationBase, TableBase):
    publication_id: int
    author: Author

    class Config:
        orm_mode = True
