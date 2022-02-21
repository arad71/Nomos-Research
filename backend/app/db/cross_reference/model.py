from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship

from app.db.models import TableMixin
from app.db.session import Base
from app.db.taxon_name.model import TaxonName


class CrossReference(Base, TableMixin):
    __tablename__ = "cross_reference"

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
    cross_reference_type = Column(String(3), nullable=False)
    active = Column(String(1), nullable=False)
    authorised_by = Column(String(60))
    comments = Column(String(1000))
    notes = Column(String(3000))
