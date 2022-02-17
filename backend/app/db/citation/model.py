from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base


class Citation(Base, TableMixin):
    __tablename__ = "citation"
    name_plural = "citations"

    citation_id = Column(Integer, primary_key=True, index=True)
    taxon_name_id = Column(Integer, ForeignKey("taxon_name.taxon_name_id"))
    taxon_name = relationship("TaxonName", back_populates=name_plural)
    author_id = Column(Integer, ForeignKey("author.author_id"))
    author = relationship("Author", back_populates=name_plural)
    author_type = Column(String())
    author_order = Column(Integer())
