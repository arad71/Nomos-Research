from typing import Optional

from pydantic import BaseModel

from app.db.schemas import TableBase
from app.db.taxon_rank import enums


class TaxonRankBase(BaseModel):
    kingdom_id: int
    rank_name: str
    rank_abbrev: Optional[enums.RankAbbreviation]
    direct_parent_rank_id: int
    required_parent_rank_id: Optional[int]


class TaxonRankCreate(TaxonRankBase):
    pass


class TaxonRankEdit(TaxonRankBase):
    pass


class TaxonRank(TaxonRankBase, TableBase):
    taxon_rank_id: int

    class Config:
        orm_mode = True
