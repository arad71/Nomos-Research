from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String, event
from sqlalchemy.orm import backref, relationship
from sqlalchemy.orm.session import Session
from sqlalchemy.schema import Index

from app.db.models import BaseModel, TableMixin
from app.db.vernacular import enums
from app.db.vernacular.calculated import trigger_taxon_name_calculated_fields
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
        Index(f"ix_{__tablename__}_taxon_name_not_deleted", "taxon_name_id",
            "vernacular_name",
            "language",
              unique=True,
              postgresql_where="deleted IS FALSE"),
        {"comment": TABLE_DESCRIPTION},
    )

    vernacular_id = Column(Integer, primary_key=True)
    vernacular_name = Column(
        String(120), nullable=False, comment=VERNACULAR, doc=VERNACULAR, index=True
    )
    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment=TAXON_NAME_ID,
        doc=TAXON_NAME_ID,
    )
    taxon_name = relationship(
        "TaxonName",
        backref=backref("vernaculars", lazy="dynamic", cascade="all, delete-orphan"),
    )
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
    sort_order = Column(Integer)


def before_flush(session, flush_context, instances):
    for item in session.__dict__["identity_map"].items():
        instance = item[1]
        if isinstance(instance, Vernacular):
            trigger_taxon_name_calculated_fields(session, instance)


event.listen(Session, "before_flush", before_flush)
