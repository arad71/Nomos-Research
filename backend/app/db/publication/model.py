from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import backref, relationship
from sqlalchemy.types import Enum

from app.db.models import TableMixin
from app.db.publication import enums
from app.db.publication.constants import (
    BAD_PUBLICATION,
    PUBLICATION_ID,
    TABLE_DESCRIPTION,
)
from app.db.session import Base


class Publication(Base, TableMixin):
    __tablename__ = "publication"
    __table_args__ = {"comment": TABLE_DESCRIPTION}

    publication_id = Column(
        Integer,
        primary_key=True,
        comment=PUBLICATION_ID,
        doc=PUBLICATION_ID,
    )
    publication = Column(Text, nullable=False)
    bad_publication = Column(
        Enum(enums.BadPublication, name=__tablename__ + "__bad_publication"),
        comment=BAD_PUBLICATION,
        doc=BAD_PUBLICATION,
    )
    publication_name = Column(Text)
    doi = Column(String)
    title = Column(String)
    display_title = Column(String)
    abbreviated_title = Column(String)
    year = Column(Integer)
    volume = Column(String)
    edition = Column(String)
    pages = Column(String)
    verbatim_reference = Column(String)
    verbatim_citation = Column(String)
    verbatim_author = Column(String)
    citation = Column(String)
    citation_html = Column(String)
    citation_author_year = Column(String)
    notes = Column(String)
    published = Column(Boolean)
    publisher = Column(String)
    published_location = Column(String)
    publication_date = Column(String)
    isbn = Column(String)
    issn = Column(String)
    bhl_url = Column(String)
    tl2 = Column(String)
    reference_type = Column(String)
    parent_id = Column(Integer, ForeignKey("publication.publication_id"))
    parent = relationship(
        "Publication",
        foreign_keys=[parent_id],
        remote_side=[publication_id],
        backref=backref("children"),
    )
    author = relationship(
        "Author", secondary="publication_author", back_populates="publications"
    )
    reference_author_role = Column(String)
    language = Column(String)
    duplicate_of_id = Column(Integer, ForeignKey("publication.publication_id"))
    duplicate_of = relationship(
        "Publication",
        foreign_keys=[duplicate_of_id],
        remote_side=[publication_id],
        backref=backref("duplicates"),
    )
