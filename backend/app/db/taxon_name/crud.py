import app.db.crud as crud
from app.db.taxon_name.model import TaxonName


class TaxonNameCrud(crud.Crud):
    model = TaxonName
    id_key = "taxon_name_id"
    name = "Taxon Name"
