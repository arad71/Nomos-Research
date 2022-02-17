from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base


class InformalGroup(Base, TableMixin):
    __tablename__ = "informal_group"

    informal_group_id = Column(String(10), primary_key=True, index=True)
    classification_system_id = Column(
        Integer,
        ForeignKey("classification_system.classification_system_id"),
        index=True,
    )
    classification_system = relationship("ClassificationSystem", back_populates="informal_groups")
    taxon_name_id = Column(Integer, ForeignKey("taxon_name.taxon_name_id"))
    taxon_name = relationship("TaxonName", back_populates="informal_groups")
