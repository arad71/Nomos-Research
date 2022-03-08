from sqlalchemy import Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base
from app.db.vernacular import enums


class Vernacular(Base, TableMixin):
    __tablename__ = "vernacular"
    __table_args__ = {
        "comment": "The common or vernacular names recorded for Latin names, where they exist"
    }

    vernacular_id = Column(Integer, primary_key=True, index=True)
    vernacular = Column(
        String(120), nullable=False, comment="A common name for this scientific name"
    )
    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment="The TaxonID for this name",
    )
    taxon_name = relationship("TaxonName", backref="vernaculars")
    language = Column(
        Enum(enums.Language, name=__tablename__ + "__language"),
        nullable=False,
        comment="The language or of origin of this name",
    )
    lang_pref = Column(
        Enum(enums.LangPref, name=__tablename__ + "__lang_pref"),
        comment="Type of name (EU=European, AB = Aboriginal)",
    )
    preferred = Column(
        Enum(enums.Preferred, name=__tablename__ + "__preferred"),
        comment="Flag indicatin if this is the overall preferred vernacular name for this latin name",
    )
    source = Column(String(50), comment="The source or contributor of this name")
    enabled = Column(
        Enum(enums.Enabled, name=__tablename__ + "__enabled"), nullable=False
    )
    sort_order = Column(Integer)
