import app.db.crud as crud
from app.db.conscode_taxon.model import Conscodetaxon


class ConscodetaxonCrud(crud.Crud):
    model = Conscodetaxon
    id_key = "conscode_taxon_id"
    name = "Cons code"
    search_fields = [
        "taxon_name___scientific_name",
        "conservation_code___authorising_org",
        "conservation_code___conservation_code_value",
        "conservation_code___code_priority",
    ]
