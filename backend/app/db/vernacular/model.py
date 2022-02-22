from sqlalchemy import Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base
from app.db.vernacular import enums


class Vernacular(Base, TableMixin):
    __tablename__ = "vernacular"

    vernacular_id = Column(Integer, primary_key=True, index=True)
    vernacular = Column(String(120), nullable=False)
    taxon_name_id = Column(Integer, ForeignKey("taxon_name.taxon_name_id"))
    taxon_name = relationship("TaxonName", backref="vernaculars")
    language = Column(Enum(enums.Language), nullable=False)
    lang_pref = Column(Enum(enums.LangPref))
    preferred = Column(Enum(enums.Preferred))
    source = Column(String(50))
    enabled = Column(Enum(enums.Enabled), nullable=False)
    sort_order = Column(Integer)
