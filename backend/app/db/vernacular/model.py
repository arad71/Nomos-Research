from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.schema import UniqueConstraint

from app.db.models import BaseModel, TableMixin
from app.db.vernacular import enums
from app.db.vernacular.constants import (
    LANG_PREF,
    LANGUAGE,
    PREFERRED,
    SOURCE,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
    VERNACULAR,
)


class Vernacular(BaseModel, TableMixin):
    __tablename__ = "vernacular"
    __table_args__ = (
        UniqueConstraint(
            "taxon_name_id",
            "vernacular",
            "language",
            name=f"uc_{ __tablename__}_legacy_id",
        ),
        {"comment": TABLE_DESCRIPTION},
    )

    vernacular_id = Column(Integer, primary_key=True)
    vernacular = Column(String(120), nullable=False, comment=VERNACULAR, doc=VERNACULAR)
    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment=TAXON_NAME_ID,
        doc=TAXON_NAME_ID,
    )
    taxon_name = relationship("TaxonName", backref="vernaculars")
    language = Column(
        Enum(enums.Language, name=__tablename__ + "__language"),
        nullable=False,
        comment=LANGUAGE,
        doc=LANGUAGE,
    )
    lang_pref = Column(
        Boolean,
        comment=LANG_PREF,
        doc=LANG_PREF,
    )
    preferred = Column(
        Boolean,
        comment=PREFERRED,
        doc=PREFERRED,
    )
    source = Column(String(50), comment=SOURCE, doc=SOURCE)
    enabled = Column(Boolean, nullable=False)
    sort_order = Column(Integer)
