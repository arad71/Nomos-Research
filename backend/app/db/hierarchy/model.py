from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import backref, relationship

from app.db.hierarchy.constants import (
    CLASSIFICATION_SYSTEM_ID,
    PARENT_NAME_ID,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
)
from app.db.models import TableMixin
from app.db.session import Base
from app.db.taxon_name.model import TaxonName


class Hierarchy(Base, TableMixin):
    __tablename__ = "hierarchy"
    __table_args__ = {"comment": TABLE_DESCRIPTION}
    name_plural = "hierarchies"

    hierarchy_id = Column(Integer, primary_key=True)
    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment=TAXON_NAME_ID,
        doc=TAXON_NAME_ID,
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
        comment=CLASSIFICATION_SYSTEM_ID,
        doc=CLASSIFICATION_SYSTEM_ID,
    )
    classification_system = relationship("ClassificationSystem", backref=name_plural)
    parent_nid = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment=PARENT_NAME_ID,
        doc=PARENT_NAME_ID,
    )
    parent = relationship(
        "TaxonName",
        foreign_keys=[parent_nid],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("children"),
    )
