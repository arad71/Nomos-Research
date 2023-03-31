from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.types import Enum

from app.db.cross_reference import enums
from app.db.cross_reference.constants import (
    AUTHORISED_BY,
    COMMENTS,
    CROSS_REFERENCE_ID,
    CROSS_REFERENCE_TYPE,
    NEW_NAME_ID,
    OLD_NAME_ID,
    TABLE_DESCRIPTION,
)
from app.db.models import BaseModel, TableMixin
from app.db.taxon_name.model import TaxonName


class CrossReference(BaseModel, TableMixin):
    __tablename__ = "cross_reference"
    __table_args__ = (
        UniqueConstraint(
            "legacy_id", "deleted_on", name=f"uc_{ __tablename__}_legacy_id"
        ),
        {"comment": TABLE_DESCRIPTION},
    )

    cross_reference_id = Column(
        Integer,
        primary_key=True,
        comment=CROSS_REFERENCE_ID,
        doc=CROSS_REFERENCE_ID,
    )
    old_name_id = Column(
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
        backref=backref("cross_referenced_old_name", cascade="all, delete-orphan"),
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
        backref=backref("cross_referenced_new_name", cascade="all, delete-orphan"),
    )
    cross_reference_type = Column(
        Enum(enums.CrossReferenceType, name=__tablename__ + "__cross_reference_type"),
        nullable=False,
        comment=CROSS_REFERENCE_TYPE,
        doc=CROSS_REFERENCE_TYPE,
    )
    authorised_yr = Column(Integer, index=True, comment="The year of authorisation")
    authorised_mn = Column(Integer, index=True, comment="The month of authorisation")
    authorised_dy = Column(Integer, index=True, comment="The day of authorisation")
    authorised_by = Column(String(60), comment=AUTHORISED_BY, doc=AUTHORISED_BY)
    reference_comments = Column(String(1000), comment=COMMENTS, doc=COMMENTS)
    notes = Column(String(3000))
    legacy_id = Column(Integer)
