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
    kingdom_id = Column(
        Integer,
        ForeignKey("kingdom.kingdom_id"),
        nullable=False,
        comment="The kingdom ID this rank and its parentage applies to",
    )
    kingdom = relationship("Kingdom", backref="taxon_ranks")
    # New comment does not match new column name?
    rank_name = Column(String(15), nullable=False, comment="The ID of this rank")
    rank_abbrev = Column(
        Enum(enums.RankAbbreviation, name=__tablename__ + "__rank_abbrev"),
        comment="The rank abbreviation (generally for ranks below species)",
    )
    direct_parent_rank_id = Column(
        Integer,
        ForeignKey("taxon_rank.taxon_rank_id"),
        nullable=True,
        index=True,
        comment="The direct parent of this rank",
    )
    direct_parent_rank = relationship(
        "TaxonRank",
        foreign_keys=[direct_parent_rank_id],
        remote_side=[taxon_rank_id],
        backref=backref("direct_child_ranks"),
    )
    required_parent_rank_id = Column(
        Integer,
        ForeignKey("taxon_rank.taxon_rank_id"),
        nullable=True,
        index=True,
        comment="The mandatory, or required parent, of this rank",
    )
    required_parent_rank = relationship(
        "TaxonRank",
        foreign_keys=[required_parent_rank_id],
        remote_side=[taxon_rank_id],
        backref=backref("required_child_ranks"),
    )
