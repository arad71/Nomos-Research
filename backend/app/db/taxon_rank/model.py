from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship

from app.db.models import TableMixin
from app.db.session import Base


class TaxonRank(Base, TableMixin):
    __tablename__ = "taxon_rank"

    taxon_rank_id = Column(Integer, primary_key=True, index=True)
    kingdom_id = Column(Integer, ForeignKey("kingdom.kingdom_id"), nullable=False)
    kingdom = relationship("Kingdom", backref="taxon_ranks")
    rank_name = Column(String(15), nullable=False)
    rank_abbrev = Column(String(9))
    direct_parent_rank_id = Column(
        Integer, ForeignKey("taxon_rank.taxon_rank_id"), nullable=False
    )
    direct_parent_rank = relationship(
        "TaxonRank",
        foreign_keys=[direct_parent_rank_id],
        remote_side=[taxon_rank_id],
        backref=backref("direct_child_ranks"),
    )
    required_parent_rank_id = Column(
        Integer, ForeignKey("taxon_rank.taxon_rank_id"), nullable=False
    )
    required_parent_rank = relationship(
        "TaxonRank",
        foreign_keys=[required_parent_rank_id],
        remote_side=[taxon_rank_id],
        backref=backref("required_child_ranks"),
    )
