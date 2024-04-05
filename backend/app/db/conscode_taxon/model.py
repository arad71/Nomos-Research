# from datetime import datetime

# from sqlalchemy import TIMESTAMP
from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import Index

from app.db.conscode_taxon.constants import (  # NOTES,
    CONSERVATION_CODE_ID,
    EFFECTIVE_FROM,
    EFFECTIVE_TO,
    ISACTIVE,
    TABLE_DESCRIPTION,
)
from app.db.models import BaseModel, TableMixin


class Conscodetaxon(BaseModel, TableMixin):
    __tablename__ = "conscode_taxon"
    name_plural = "conscode_taxons"
    conscode_taxon_id = Column(Integer, primary_key=True)
    conservation_code_id = Column(
        Integer,
        ForeignKey("conservation_code.conservation_code_id"),
        index=True,
        comment=CONSERVATION_CODE_ID,
        doc=CONSERVATION_CODE_ID,
    )
    conservation_code = relationship(
        "Conservationcode", foreign_keys=[conservation_code_id], backref=name_plural
    )
    taxon_name_id = Column(
        Integer, ForeignKey("taxon_name.taxon_name_id"), nullable=False
    )
    taxon_name = relationship(
        "TaxonName",
        foreign_keys=[taxon_name_id],
        backref=backref(name_plural, cascade="all, delete-orphan"),
    )
    notes = Column(String(3000), nullable=True)

    source = Column(String(100), nullable=True, default="Test")

    legacy_id_columns = ["conservation_code_id", "taxon_name_id"]
    __table_args__ = (
        Index(
            f"ix_{__tablename__}_legacy_id_isactive",
            *legacy_id_columns,
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        {"comment": TABLE_DESCRIPTION},
    )
    effective_from = Column(
        # TIMESTAMP(timezone=True),
        Date,
        nullable=False,
        # default=func.current_timestamp(),
        comment=EFFECTIVE_FROM,
        doc=EFFECTIVE_FROM,
    )
    effective_to = Column(
        # TIMESTAMP(timezone=True),
        Date,
        nullable=True,
        comment=EFFECTIVE_TO,
        doc=EFFECTIVE_TO,
    )
    isactive = Column(Boolean, default=True, comment=ISACTIVE, doc=ISACTIVE)
