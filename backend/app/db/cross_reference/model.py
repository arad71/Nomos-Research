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

    cross_reference_id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="The unique record number for this cross-reference",
    )
    old_name_id = Column(
        # original comment "Th old NameID, or NameID this reference is about" fixed typo?
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment="The old NameID, or NameID this reference is about",
    )
    old_name = relationship(
        "TaxonName",
        foreign_keys=[old_name_id],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("cross_referenced_old_name"),
    )
    new_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment="The new NameID, or the NameID of the name this reference points to",
    )
    new_name = relationship(
        "TaxonName",
        foreign_keys=[new_name_id],
        remote_side=[TaxonName.taxon_name_id],
        backref=backref("cross_referenced_new_name"),
    )
    cross_reference_type = Column(
        Enum(enums.CrossReferenceType, name=__tablename__ + "__cross_reference_type"),
        nullable=False,
        comment="The type of cross-reference",
    )
    active = Column(
        Enum(enums.Active, name=__tablename__ + "__active"),
        nullable=False,
        comment="Flag indicating if this reference is active or not",
    )
    # Was previously YR/MN/DY columns, comment derived from original
    authorised_date = Column(DateTime, index=True, comment="The date of authorisation")
    authorised_by = Column(
        String(60), comment="The person who authorised this cross-reference"
    )
    comments = Column(
        String(1000), comment="Other informative comments about the cross-reference"
    )
    notes = Column(String(3000))
