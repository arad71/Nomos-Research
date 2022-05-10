import app.db.crud as crud
from app.db.taxon_name.model import TaxonName


class TaxonNameCrud(crud.Crud):
    model = TaxonName
    id_key = "taxon_name_id"
    name = "Taxon Name"
    search_fields = [
        "scientific_name",
        "author",
        "all_vernaculars",
        "phylum",
        "taxon_class",
        "order",
        "family",
        "cross_referenced_old_name___new_name___scientific_name",
    ]
