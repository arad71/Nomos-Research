from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, event
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import Index

from app.db.models import BaseModel, TableMixin
from app.db.publication.calculated import calculate_fields
from app.db.publication.constants import PUBLICATION_ID, TABLE_DESCRIPTION


class Publication(BaseModel, TableMixin):
    __tablename__ = "publication"
    __table_args__ = (
        Index(f"ix_{__tablename__}_legacy_id", "legacy_id",
              unique=True,
              postgresql_where="deleted IS FALSE"),
        {"comment": TABLE_DESCRIPTION},
    )

    publication_id = Column(
        Integer,
        primary_key=True,
        comment=PUBLICATION_ID,
        doc=PUBLICATION_ID,
    )
    doi = Column(String)
    title = Column(String)
    abbreviated_title = Column(String)
    publication_year = Column(Integer)
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
    publication_month = Column(Integer)
    publication_day = Column(Integer)
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
    legacy_id = Column(Integer)

    @hybrid_property
    def author_names(self):
        return [publication_author.display_name for publication_author in self.author]

    @hybrid_property
    def author_ids(self):
        return [publication_author.author_id for publication_author in self.author]

    @hybrid_property
    def author_name(self):
        return ", ".join([author.display_name for author in self.author])

    @hybrid_property
    def display_title(self):
        if self.title:
            return self.title
        elif self.abbreviated_title:
            return self.abbreviated_title


event.listen(Publication, "before_insert", calculate_fields)
event.listen(Publication, "before_update", calculate_fields)
