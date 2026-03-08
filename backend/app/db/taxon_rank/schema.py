from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

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
    rank_abbrev: Optional[enums.RankAbbreviation] = Field(
        None, description=RANK_ABBREVIATION
    )
    direct_parent_rank_id: Optional[int] = Field(None, description=DIRECT_PARENT)
    required_parent_rank_id: Optional[int] = Field(None, description=REQUIRED_PARENT)
    uninomial: bool
    legacy_id: Optional[int] = None


class TaxonRankCreate(TaxonRankBase):
    pass


class TaxonRankEdit(TaxonRankBase):
    pass


class TaxonRank(TaxonRankBase, TableBase):
    taxon_rank_id: int
    kingdom_name: Optional[str] = None

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )
