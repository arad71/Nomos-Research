from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base


class Publication(Base, TableMixin):
    __tablename__ = "publication"

    publication_id = Column(Integer, primary_key=True, index=True)
    bad_publication = Column(String(1))
    publication = Column(Text)
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
    parent = Column(Integer, ForeignKey("publication.publication_id"))
    author = relationship(
        "Author", secondary="publication_author", back_populates="publication"
    )
    reference_author_role = Column(String)
    language = Column(String)
    duplicate_of = Column(Integer, ForeignKey("publication.publication_id"))
