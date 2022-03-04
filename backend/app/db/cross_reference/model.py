from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.types import Enum

from app.db.cross_reference import enums
from app.db.models import TableMixin
from app.db.session import Base
from app.db.taxon_name.model import TaxonName


class CrossReference(Base, TableMixin):
    __tablename__ = "cross_reference"
    __table_args__ = {
        "comment": "All active and non-active transactions which change the usage of a name, usually resulting in a reference to one or more other taxa"
    }

    cross_reference_id = Column(Integer, primary_key=True, index=True)
    old_name_id = Column(
        Integer, ForeignKey("taxon_name.taxon_name_id"), nullable=False
    )
    old_name = relationship(
        "TaxonName",
        foreign_keys=[old_name_id],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("cross_referenced_old_name"),
    )
    new_name_id = Column(Integer, ForeignKey("taxon_name.taxon_name_id"))
    new_name = relationship(
        "TaxonName",
        foreign_keys=[new_name_id],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("cross_referenced_new_name"),
    )
    cross_reference_type = Column(
        Enum(enums.CrossReferenceType, name=__tablename__ + "__cross_reference_type"),
        nullable=False,
    )
    active = Column(Enum(enums.Active, name=__tablename__ + "__active"), nullable=False)
    authorised_by = Column(String(60))
    comments = Column(String(1000))
    notes = Column(String(3000))
    authorised_date = Column(DateTime, index=True)
