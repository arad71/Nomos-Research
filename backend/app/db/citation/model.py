from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum

from app.db.citation import enums
from app.db.citation.constants import *
from app.db.models import TableMixin
from app.db.session import Base


class Citation(Base, TableMixin):
    __tablename__ = "citation"
    __table_args__ = {"comment": TABLE_DESCRIPTION}
    name_plural = "citations"

    citation_id = Column(Integer, primary_key=True, index=True)
    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment=TAXON_NAME_ID,
        doc=TAXON_NAME_ID,
    )
    taxon_name = relationship("TaxonName", backref=name_plural)
    author_id = Column(Integer, ForeignKey("author.author_id"))
    author = relationship("Author", backref=name_plural)
    author_type = Column(
        Enum(enums.AuthorType, name=__tablename__ + "__author_type"),
        comment=AUTHOR_TYPE,
        doc=AUTHOR_TYPE,
    )
    author_order = Column(
        Integer(),
        comment=AUTHOR_ORDER,
        doc=AUTHOR_ORDER,
    )
