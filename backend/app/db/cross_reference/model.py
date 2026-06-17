from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import Index
from sqlalchemy.types import Enum

from app.db.cross_reference import enums
from app.db.cross_reference.constants import (
    ACTIVE,
    AUTHORISED_BY,
    AUTHORISED_ON,
    COMMENTS,
    CONTRIBUTED_BY,
    CONTRIBUTED_ON,
    CROSS_REFERENCE_ID,
    CROSS_REFERENCE_TYPE,
    EXTERNAL_COMMENTS,
    INTERNAL_COMMENTS,
    NEW_NAME_ID,
    OLD_NAME_ID,
    TABLE_DESCRIPTION,
)
from app.db.models import BaseModel, TableMixin
from app.db.publication.model import Publication
from app.db.taxon_name.model import TaxonName


class CrossReference(BaseModel, TableMixin):
    __tablename__ = "cross_reference"

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
    publication_id = Column(
        Integer,
        ForeignKey("publication.publication_id"),
        nullable=True,
        comment="Associated publication",
        doc="Associated publication",
    )

    publication = relationship(
        "Publication",
        foreign_keys=[publication_id],
        remote_side=[Publication.publication_id],
        backref=backref("cross_referenced_publication"),
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
    authorised_on = Column(
        DateTime(timezone=True), comment=AUTHORISED_ON, doc=AUTHORISED_ON
    )
    contributed_by = Column(String(100), comment=CONTRIBUTED_BY, doc=CONTRIBUTED_BY)
    contributed_on = Column(
        DateTime(timezone=True), comment=CONTRIBUTED_ON, doc=CONTRIBUTED_ON
    )
    reference_comments = Column(String(1000), comment=COMMENTS, doc=COMMENTS)
    internal_comments = Column(
        String(3000), comment=INTERNAL_COMMENTS, doc=INTERNAL_COMMENTS
    )
    external_comments = Column(
        String(3000), comment=EXTERNAL_COMMENTS, doc=EXTERNAL_COMMENTS
    )
    notes = Column(String(3000))
    legacy_id = Column(Integer)
    is_active = Column(Boolean, default=True, comment=ACTIVE, doc=ACTIVE)
    legacy_id_columns = ["legacy_id"]

    __table_args__ = (
        # Rule 1: Conditional NULL for new_name_id
        CheckConstraint(
            """
            new_name_id IS NOT NULL
            OR cross_reference_type IN (
                'Excluded Name',
                'Name Entered in Error'
            )
            """,
            name="chk_cross_reference_new_name_required",
        ),
        # Rule 2: Mandatory rationale when new_name_id IS NULL
        CheckConstraint(
            """
            new_name_id IS NOT NULL
            OR (
                reference_comments IS NOT NULL
                AND length(trim(reference_comments)) > 0
            )
            """,
            name="chk_cross_reference_rationale_required",
        ),
        # Existing legacy index
        Index(
            f"ix_{__tablename__}_legacy_id_isactive",
            *legacy_id_columns,
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        {"comment": TABLE_DESCRIPTION},
    )
