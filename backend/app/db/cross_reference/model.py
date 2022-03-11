from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.types import Enum

from app.db.cross_reference import enums
from app.db.cross_reference.constants import *
from app.db.models import TableMixin
from app.db.session import Base
from app.db.taxon_name.model import TaxonName


class CrossReference(Base, TableMixin):
    __tablename__ = "cross_reference"
    __table_args__ = {"comment": TABLE_DESCRIPTION}

    cross_reference_id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment=CROSS_REFERENCE_ID,
        doc=CROSS_REFERENCE_ID,
    )
    old_name_id = Column(
        # original comment "Th old NameID, or NameID this reference is about" fixed typo?
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment=OLD_NAME_ID,
        doc=OLD_NAME_ID,
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
        comment=NEW_NAME_ID,
        doc=NEW_NAME_ID,
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
        comment=CROSS_REFERENCE_TYPE,
        doc=CROSS_REFERENCE_TYPE,
    )
    active = Column(
        Enum(enums.Active, name=__tablename__ + "__active"),
        nullable=False,
        comment=ACTIVE,
        doc=ACTIVE,
    )
    # Was previously YR/MN/DY columns, comment derived from original
    authorised_date = Column(DateTime, index=True, comment="The date of authorisation")
    authorised_by = Column(String(60), comment=AUTHORISED_BY, doc=AUTHORISED_BY)
    comments = Column(String(1000), comment=COMMENTS, doc=COMMENTS)
    notes = Column(String(3000))
