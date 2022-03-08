from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import backref, relationship

from app.db.models import TableMixin
from app.db.session import Base
from app.db.taxon_name.model import TaxonName


class Hierarchy(Base, TableMixin):
    __tablename__ = "hierarchy"
    __table_args__ = {"comment": "This table indicates the parentage of each name"}
    name_plural = "hierarchies"

    hierarchy_id = Column(Integer, primary_key=True, index=True)
    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment="Unique identifier for name",
    )
    taxon_name = relationship(
        "TaxonName",
        foreign_keys=[taxon_name_id],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("names"),
    )
    classification_system_id = Column(
        Integer,
        ForeignKey("classification_system.classification_system_id"),
        index=True,
        comment="The taxonomic classification system used for this parentage",
    )
    classification_system = relationship("ClassificationSystem", backref=name_plural)
    parent_nid = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment="Parent NameID of this taxon name",
    )
    parent = relationship(
        "TaxonName",
        foreign_keys=[parent_nid],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("children"),
    )
