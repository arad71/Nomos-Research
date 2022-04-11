from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.types import Enum

from app.db.models import TableMixin
from app.db.session import Base
from app.db.taxon_rank import enums
from app.db.taxon_rank.constants import (
    DIRECT_PARENT,
    KINGDOM_ID,
    RANK_ABBREVIATION,
    RANK_NAME,
    REQUIRED_PARENT,
    TABLE_DESCRIPTION,
)


class TaxonRank(Base, TableMixin):
    __tablename__ = "taxon_rank"
    __table_args__ = (
        UniqueConstraint(
            "legacy_id", "kingdom_id", name=f"uc_{ __tablename__}_legacy_id"
        ),
        {"comment": TABLE_DESCRIPTION},
    )

    taxon_rank_id = Column(Integer, primary_key=True)
    kingdom_id = Column(
        Integer,
        ForeignKey("kingdom.kingdom_id"),
        nullable=False,
        comment=KINGDOM_ID,
        doc=KINGDOM_ID,
    )
    kingdom = relationship("Kingdom", backref="taxon_ranks")
    rank_name = Column(String(15), nullable=False, comment=RANK_NAME, doc=RANK_NAME)
    rank_abbrev = Column(
        Enum(enums.RankAbbreviation, name=__tablename__ + "__rank_abbrev"),
        comment=RANK_ABBREVIATION,
        doc=RANK_ABBREVIATION,
    )
    direct_parent_rank_id = Column(
        Integer,
        ForeignKey("taxon_rank.taxon_rank_id"),
        nullable=True,
        index=True,
        comment=DIRECT_PARENT,
        doc=DIRECT_PARENT,
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
        comment=REQUIRED_PARENT,
        doc=REQUIRED_PARENT,
    )
    required_parent_rank = relationship(
        "TaxonRank",
        foreign_keys=[required_parent_rank_id],
        remote_side=[taxon_rank_id],
        backref=backref("required_child_ranks"),
    )
    uninomial = Column(String)
    legacy_id = Column(Integer)
