from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declared_attr

from app.db.session import Base
from app.db.models import TableMixin


class TaxonRank(Base, TableMixin):
    __tablename__ = "taxon_rank"

    kingdom_id = Column(Integer, primary_key=True, index=True)
    rank_id = Column(Integer, nullable=False)
    rank_name = Column(String(15), nullable=False)
    rank_abbrev = Column(String(9))
    direct_parent_rank_id = Column(Integer, nullable=False)
    required_parent_rank_id = Column(Integer, nullable=False)
