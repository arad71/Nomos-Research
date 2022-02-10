from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.ext.declarative import declared_attr

from app.db.models import TableMixin
from app.db.session import Base


class Vernacular(Base, TableMixin):
    __tablename__ = "vernacular"

    vernacular_id = Column(Integer, primary_key=True, index=True)
    vernacular = Column(String(120), nullable=False)
    taxon_name_id = Column(Integer)
    language = Column(String(20), nullable=False)
    lang_pref = Column(String(1))
    preferred = Column(String(1))
    source = Column(String(50))
    enabled = Column(String(1), nullable=False)
    sort_order = Column(Integer)
