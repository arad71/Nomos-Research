from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base


class InformalGroup(Base, TableMixin):
    __tablename__ = "informal_group"
    __table_args__ = {
        "comment": "The various informal groups through which names can be classified"
    }
    name_plural = "informal_groups"

    informal_group_id = Column(Integer, primary_key=True, index=True)
    classification_system_id = Column(
        Integer,
        ForeignKey("classification_system.classification_system_id"),
        index=True,
    )
    classification_system = relationship("ClassificationSystem", backref=name_plural)
    taxon_name_id = Column(Integer, ForeignKey("taxon_name.taxon_name_id"))
    taxon_name = relationship("TaxonName", backref=name_plural)
