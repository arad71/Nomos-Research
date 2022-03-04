from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum

from app.db.citation import enums
from app.db.models import TableMixin
from app.db.session import Base


class Citation(Base, TableMixin):
    __tablename__ = "citation"
    __table_args__ = {
        "comment": "A list of all authors associated with this name, including basionym authors and editors"
    }
    name_plural = "citations"

    citation_id = Column(Integer, primary_key=True, index=True)
    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment="NAMEID this author applies to",
    )
    taxon_name = relationship("TaxonName", backref=name_plural)
    author_id = Column(Integer, ForeignKey("author.author_id"))
    author = relationship("Author", backref=name_plural)
    author_type = Column(
        Enum(enums.AuthorType, name=__tablename__ + "__author_type"),
        comment="The type of author entry: BASIONYM, CURRENT, EDITOR",
    )
    author_order = Column(
        Integer(),
        comment="The order in which authors should appear. The value itself is meaningless and serves solely as part of an ORDER BY clause when assembling the citation.",
    )
