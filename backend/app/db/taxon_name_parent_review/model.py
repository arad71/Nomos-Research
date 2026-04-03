import sqlalchemy
from sqlalchemy.orm import relationship
from sqlalchemy.schema import Index

from app.db.models import BaseModel, TableMixin

from . import constants


class TaxonNameParentReview(BaseModel, TableMixin):
    __tablename__ = "taxon_name_parent_review"
    name_plural = "taxon_name_parent_reviews"
    __repr_attrs__ = [
        "taxon_name_parent_review_id",
        "taxon_name_id",
        "status",
        "reason",
    ]

    taxon_name_parent_review_id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    taxon_name_id = sqlalchemy.Column(
        sqlalchemy.Integer,
        sqlalchemy.ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        comment=constants.TAXON_NAME_ID,
        doc=constants.TAXON_NAME_ID,
    )
    status = sqlalchemy.Column(
        sqlalchemy.String(64),
        nullable=False,
        index=True,
        comment=constants.STATUS,
        doc=constants.STATUS,
    )
    reason = sqlalchemy.Column(
        sqlalchemy.String(128),
        nullable=True,
        index=True,
        comment=constants.REASON,
        doc=constants.REASON,
    )
    legacy_uninomial = sqlalchemy.Column(
        sqlalchemy.String,
        nullable=True,
        comment=constants.LEGACY_UNINOMIAL,
        doc=constants.LEGACY_UNINOMIAL,
    )
    derived_uninomial = sqlalchemy.Column(
        sqlalchemy.String,
        nullable=True,
        comment=constants.DERIVED_UNINOMIAL,
        doc=constants.DERIVED_UNINOMIAL,
    )
    candidate_parent_ids = sqlalchemy.Column(
        sqlalchemy.Text,
        nullable=True,
        comment=constants.CANDIDATE_PARENT_IDS,
        doc=constants.CANDIDATE_PARENT_IDS,
    )
    candidate_parent_names = sqlalchemy.Column(
        sqlalchemy.Text,
        nullable=True,
        comment=constants.CANDIDATE_PARENT_NAMES,
        doc=constants.CANDIDATE_PARENT_NAMES,
    )
    parent_count = sqlalchemy.Column(
        sqlalchemy.Integer,
        nullable=True,
        comment=constants.PARENT_COUNT,
        doc=constants.PARENT_COUNT,
    )
    hybrid_category = sqlalchemy.Column(
        sqlalchemy.String(64),
        nullable=True,
        comment=constants.HYBRID_CATEGORY,
        doc=constants.HYBRID_CATEGORY,
    )
    hierarchy_confirmed = sqlalchemy.Column(
        sqlalchemy.Boolean,
        nullable=True,
        comment=constants.HIERARCHY_CONFIRMED,
        doc=constants.HIERARCHY_CONFIRMED,
    )
    hierarchy_confirmation_note = sqlalchemy.Column(
        sqlalchemy.String(255),
        nullable=True,
        comment=constants.HIERARCHY_CONFIRMATION_NOTE,
        doc=constants.HIERARCHY_CONFIRMATION_NOTE,
    )
    has_hierarchy_rows = sqlalchemy.Column(
        sqlalchemy.Boolean,
        nullable=True,
        comment=constants.HAS_HIERARCHY_ROWS,
        doc=constants.HAS_HIERARCHY_ROWS,
    )
    infrageneric_confirmed = sqlalchemy.Column(
        sqlalchemy.Boolean,
        nullable=True,
        comment=constants.INFRAGENERIC_CONFIRMED,
        doc=constants.INFRAGENERIC_CONFIRMED,
    )
    infrageneric_confirmation_note = sqlalchemy.Column(
        sqlalchemy.String(255),
        nullable=True,
        comment=constants.INFRAGENERIC_CONFIRMATION_NOTE,
        doc=constants.INFRAGENERIC_CONFIRMATION_NOTE,
    )
    review_notes = sqlalchemy.Column(
        sqlalchemy.String(1000),
        nullable=True,
        comment=constants.REVIEW_NOTES,
        doc=constants.REVIEW_NOTES,
    )
    reviewed_by = sqlalchemy.Column(
        sqlalchemy.Integer,
        sqlalchemy.ForeignKey("user.user_id"),
        nullable=True,
        index=True,
        comment=constants.REVIEWED_BY,
        doc=constants.REVIEWED_BY,
    )
    reviewed_on = sqlalchemy.Column(
        sqlalchemy.TIMESTAMP(timezone=True),
        nullable=True,
        index=True,
        comment=constants.REVIEWED_ON,
        doc=constants.REVIEWED_ON,
    )

    taxon_name = relationship("TaxonName", foreign_keys=[taxon_name_id], lazy="joined")

    __table_args__ = (
        Index(
            "ix_taxon_name_parent_review_taxon_name_id_isactive",
            "taxon_name_id",
            unique=True,
            postgresql_where=sqlalchemy.text("deleted = FALSE"),
        ),
        {"comment": constants.TABLE_DESCRIPTION},
    )
