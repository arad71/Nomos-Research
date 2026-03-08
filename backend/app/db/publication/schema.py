from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.db.author.schema import Author
from app.db.publication.constants import PUBLICATION_ID, TABLE_DESCRIPTION
from app.db.schemas import TableBase


class PublicationBase(BaseModel):
    doi: Optional[str] = None
    title: Optional[str] = None
    display_title: Optional[str] = None
    abbreviated_title: Optional[str] = None
    publication_year: Optional[int] = None
    publication_month: Optional[int] = None
    publication_day: Optional[int] = None
    volume: Optional[str] = None
    edition: Optional[str] = None
    pages: Optional[str] = None
    verbatim_reference: Optional[str] = None
    verbatim_citation: Optional[str] = None
    verbatim_author: Optional[str] = None
    citation: Optional[str] = None
    citation_html: Optional[str] = None
    citation_author_year: Optional[str] = None
    notes: Optional[str] = None
    published: Optional[bool] = None
    publisher: Optional[str] = None
    published_location: Optional[str] = None
    publication_date: Optional[str] = None
    isbn: Optional[str] = None
    issn: Optional[str] = None
    bhl_url: Optional[str] = None
    tl2: Optional[str] = None
    reference_type: Optional[str] = None
    parent_id: Optional[int] = None
    reference_author_role: Optional[str] = None
    language: Optional[str] = None
    duplicate_of_id: Optional[int] = None
    legacy_id: Optional[int] = None
    author_ids: Optional[list[int]] = None


class PublicationCreate(PublicationBase):
    pass


class PublicationEdit(PublicationBase):
    pass


class Publication(PublicationBase, TableBase):
    publication_id: int = Field(description=PUBLICATION_ID)
    author: list[Author]
    author_names: Optional[list[str]] = None
    author_name: Optional[str] = None
    display_title: Optional[str] = None
    deleted: bool

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )
