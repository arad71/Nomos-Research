from sqlalchemy import Column, Integer, String

from app.db.models import TableMixin
from app.db.session import Base


class TaxonRank(Base, TableMixin):
    __tablename__ = "taxon_rank"

    taxon_rank_id = Column(Integer, primary_key=True, index=True)
    kingdom_id = Column(Integer, nullable=False)
    rank_name = Column(String(15), nullable=False)
    rank_abbrev = Column(String(9))
    direct_parent_rank_id = Column(Integer, nullable=False)
    required_parent_rank_id = Column(Integer, nullable=False)
