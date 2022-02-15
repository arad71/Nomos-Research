from app.db.schemas import TableBase


class TaxonRankBase(TableBase):
    kingdom_id: int
    rank_id: int
    rank_name: str
    rank_abbrev: str
    direct_parent_rank_id: int
    required_parent_rank_id: int


class TaxonRankCreate(TaxonRankBase):
    pass


class TaxonRankEdit(TaxonRankBase):
    pass


class TaxonRank(TaxonRankBase):
    taxon_rank_id: int

    class Config:
        orm_mode = True
