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
    vernacular = Column(String(120), nullable=False)
    taxon_name_id = Column(Integer, ForeignKey("taxon_name.taxon_name_id"))
    taxon_name = relationship("TaxonName", backref="vernaculars")
    language = Column(
        Enum(enums.Language, name=__tablename__ + "__language"), nullable=False
    )
    lang_pref = Column(Enum(enums.LangPref, name=__tablename__ + "__lang_pref"))
    preferred = Column(Enum(enums.Preferred, name=__tablename__ + "__preferred"))
    source = Column(String(50))
    enabled = Column(
        Enum(enums.Enabled, name=__tablename__ + "__enabled"), nullable=False
    )
    sort_order = Column(Integer)
