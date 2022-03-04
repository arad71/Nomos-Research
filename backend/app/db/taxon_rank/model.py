from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.types import Enum

from app.db.models import TableMixin
from app.db.session import Base
from app.db.taxon_rank import enums


class TaxonRank(Base, TableMixin):
    __tablename__ = "taxon_rank"
    __table_args__ = {"comment": "The ranks and their parentage"}

    taxon_rank_id = Column(Integer, primary_key=True, index=True)
    kingdom_id = Column(Integer, ForeignKey("kingdom.kingdom_id"), nullable=False)
    kingdom = relationship("Kingdom", backref="taxon_ranks")
    rank_name = Column(String(15), nullable=False)
    rank_abbrev = Column(
        Enum(enums.RankAbbreviation, name=__tablename__ + "__rank_abbrev")
    )
    direct_parent_rank_id = Column(
        Integer, ForeignKey("taxon_rank.taxon_rank_id"), nullable=True, index=True
    )
    direct_parent_rank = relationship(
        "TaxonRank",
        foreign_keys=[direct_parent_rank_id],
        remote_side=[taxon_rank_id],
        backref=backref("direct_child_ranks"),
    )
    required_parent_rank_id = Column(
        Integer, ForeignKey("taxon_rank.taxon_rank_id"), nullable=True, index=True
    )
    required_parent_rank = relationship(
        "TaxonRank",
        foreign_keys=[required_parent_rank_id],
        remote_side=[taxon_rank_id],
        backref=backref("required_child_ranks"),
    )
