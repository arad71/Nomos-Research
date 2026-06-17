from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import Index

from app.db.models import BaseModel, TableMixin
from app.db.taxon_publication.constants import (
    CROSS_REFERENCE_ID,
    FIGURE_REFERENCE,
    NOTES,
    PAGE_REFERENCE,
    PUBLICATION_ID,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
)


class TaxonPublication(BaseModel, TableMixin):
    __tablename__ = "taxon_publication"

    name_plural = "taxon_publications"

    taxon_publication_id = Column(Integer, primary_key=True)

    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=True,
        comment=TAXON_NAME_ID,
        doc=TAXON_NAME_ID,
    )

    taxon_name = relationship(
        "TaxonName",
        backref=backref(
            name_plural,
            lazy="dynamic",
            cascade="all, delete-orphan",
        ),
    )

    cross_reference_id = Column(
        Integer,
        ForeignKey("cross_reference.cross_reference_id"),
        nullable=True,
        comment=CROSS_REFERENCE_ID,
        doc=CROSS_REFERENCE_ID,
    )

    cross_reference = relationship(
        "CrossReference",
        backref=backref(
            name_plural,
            lazy="dynamic",
            cascade="all, delete-orphan",
        ),
    )

    publication_id = Column(
        Integer,
        ForeignKey("publication.publication_id"),
        nullable=False,
        comment=PUBLICATION_ID,
        doc=PUBLICATION_ID,
    )

    publication = relationship(
        "Publication",
        backref=backref(
            name_plural,
            lazy="dynamic",
            cascade="all, delete-orphan",
        ),
    )

    page_reference = Column(
        String(),
        nullable=True,
        comment=PAGE_REFERENCE,
        doc=PAGE_REFERENCE,
    )

    figure_reference = Column(
        String(),
        nullable=True,
        comment=FIGURE_REFERENCE,
        doc=FIGURE_REFERENCE,
    )

    notes = Column(
        Text(),
        nullable=True,
        comment=NOTES,
        doc=NOTES,
    )

    legacy_id_columns = ["taxon_name_id", "cross_reference_id", "publication_id"]

    __table_args__ = (
        CheckConstraint(
            """
            (
                taxon_name_id IS NOT NULL
                AND cross_reference_id IS NULL
            )
            OR (
                taxon_name_id IS NULL
                AND cross_reference_id IS NOT NULL
            )
            """,
            name="chk_taxon_publication_single_parent",
        ),
        Index(
            f"ix_{__tablename__}_taxon_publication_isactive",
            "taxon_name_id",
            "publication_id",
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        Index(
            f"ix_{__tablename__}_cross_reference_publication_isactive",
            "cross_reference_id",
            "publication_id",
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        {
            "comment": TABLE_DESCRIPTION,
        },
    )
