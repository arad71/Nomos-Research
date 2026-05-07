from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship

from app.db.models import BaseModel, TableMixin
from app.db.trusted_source.constants import (
    ACCESS_DATE,
    NOTES,
    SOURCE_IDENTIFIER,
    SOURCE_URL,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
    TRUSTED_SOURCE_NAME,
)


class TrustedSource(BaseModel, TableMixin):
    __tablename__ = "trusted_source"

    trusted_source_id = Column(Integer, primary_key=True)

    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        nullable=False,
        index=True,
        comment=TAXON_NAME_ID,
        doc=TAXON_NAME_ID,
    )
    taxon_name = relationship(
        "TaxonName",
        backref=backref(
            "trusted_sources", lazy="dynamic", cascade="all, delete-orphan"
        ),
    )

    trusted_source_name = Column(
        String(255),
        nullable=False,
        index=True,
        comment=TRUSTED_SOURCE_NAME,
        doc=TRUSTED_SOURCE_NAME,
    )
    source_identifier = Column(
        String(255),
        nullable=True,
        comment=SOURCE_IDENTIFIER,
        doc=SOURCE_IDENTIFIER,
    )
    source_url = Column(
        String(2048),
        nullable=True,
        comment=SOURCE_URL,
        doc=SOURCE_URL,
    )
    access_date = Column(
        Date,
        nullable=True,
        comment=ACCESS_DATE,
        doc=ACCESS_DATE,
    )
    notes = Column(
        String,
        nullable=True,
        comment=NOTES,
        doc=NOTES,
    )

    # Phase 1 spec explicitly allows zero, one, or multiple per taxon name —
    # so no uniqueness constraint here. TableMixin already supplies
    # `deleted`, `updated_by`, `updated_on`.
    __table_args__ = ({"comment": TABLE_DESCRIPTION},)
