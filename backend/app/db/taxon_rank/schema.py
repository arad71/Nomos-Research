from typing import Optional

from pydantic import BaseModel

from app.db.schemas import TableBase


class TaxonRankBase(BaseModel):
    kingdom_id: int
    rank_name: str
    rank_abbrev: Optional[str]
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
