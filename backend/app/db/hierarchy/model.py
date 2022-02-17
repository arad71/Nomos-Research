from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base


class Hierarchy(Base, TableMixin):
    __tablename__ = "hierarchy"
    name_plural = "hierarchies"

    hierarchy_id = Column(Integer, primary_key=True, index=True)
    taxon_name_id = Column(
        Integer, ForeignKey("taxon_name.taxon_name_id"), nullable=False
    )
    taxon_name = relationship("TaxonName", back_populates=name_plural)
    classification_system_id = Column(
        Integer,
        ForeignKey("classification_system.classification_system_id"),
        index=True,
    )
    classification_system = relationship("TaxonName", back_populates=name_plural)
    parent_nid = Column(Integer, ForeignKey("taxon_name.taxon_name_id"), nullable=False)
