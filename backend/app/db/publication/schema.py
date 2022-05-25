from typing import Optional

from pydantic import BaseModel, Field

from app.db.author.schema import Author
from app.db.publication.constants import (
    BAD_PUBLICATION,
    PUBLICATION_ID,
    TABLE_DESCRIPTION,
)
from app.db.schemas import TableBase


class PublicationBase(BaseModel):
    publication: str
    bad_publication: Optional[bool] = Field(description=BAD_PUBLICATION)
    publication_name: Optional[str]
    doi: Optional[str]
    title: Optional[str]
    display_title: Optional[str]
    abbreviated_title: Optional[str]
    publication_year: Optional[int]
    publication_month: Optional[int]
    volume: Optional[str]
    edition: Optional[str]
    pages: Optional[str]
    verbatim_reference: Optional[str]
    verbatim_citation: Optional[str]
    verbatim_author: Optional[str]
    citation: Optional[str]
    citation_html: Optional[str]
    citation_author_year: Optional[str]
    notes: Optional[str]
    published: Optional[bool]
    publisher: Optional[str]
    published_location: Optional[str]
    publication_date: Optional[str]
    isbn: Optional[str]
    issn: Optional[str]
    bhl_url: Optional[str]
    tl2: Optional[str]
    reference_type: Optional[str]
    parent_id: Optional[int]
    reference_author_role: Optional[str]
    language: Optional[str]
    duplicate_of_id: Optional[int]
    legacy_id: Optional[int]
    pass


class PublicationCreate(PublicationBase):
    pass


class PublicationEdit(PublicationBase):
    pass


class Publication(PublicationBase, TableBase):
    publication_id: int = Field(description=PUBLICATION_ID)
    author: list[Author]

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
