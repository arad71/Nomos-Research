from typing import Optional

from pydantic import BaseModel, Field

from app.db.schemas import TableBase
from app.db.taxon_rank import enums
from app.db.taxon_rank.constants import (
    DIRECT_PARENT,
    KINGDOM_ID,
    RANK_ABBREVIATION,
    RANK_NAME,
    REQUIRED_PARENT,
    TABLE_DESCRIPTION,
)


class TaxonRankBase(BaseModel):
    kingdom_id: int = Field(description=KINGDOM_ID)
    rank_name: str = Field(description=RANK_NAME)
    rank_abbrev: Optional[enums.RankAbbreviation] = Field(description=RANK_ABBREVIATION)
    direct_parent_rank_id: Optional[int] = Field(description=DIRECT_PARENT)
    required_parent_rank_id: Optional[int] = Field(description=REQUIRED_PARENT)


class TaxonRankCreate(TaxonRankBase):
    pass


class TaxonRankEdit(TaxonRankBase):
    pass


class TaxonRank(TaxonRankBase, TableBase):
    taxon_rank_id: int

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
