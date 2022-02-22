import app.db.crud as crud
from app.db.taxon_rank.model import TaxonRank


class TaxonRankCrud(crud.Crud):
    model = TaxonRank
    id_key = "taxon_rank_id"
    name = "Taxon Rank"
