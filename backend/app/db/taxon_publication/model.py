from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import Index

from app.db.models import BaseModel, TableMixin
from app.db.taxon_publication.constants import (
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
    PUBLICATION_ID,
    PAGE_REFERENCE,
    FIGURE_REFERENCE,
    NOTES,
)


class TaxonPublication(BaseModel, TableMixin):
    __tablename__ = "taxon_publication"

    name_plural = "taxon_publications"

    taxon_publication_id = Column(Integer, primary_key=True)

    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
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

    legacy_id_columns = ["taxon_name_id", "publication_id"]

    __table_args__ = (
        Index(
            f"ix_{__tablename__}_taxon_publication_isactive",
            "taxon_name_id",
            "publication_id",
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        {
            "comment": TABLE_DESCRIPTION,
        },
    )
