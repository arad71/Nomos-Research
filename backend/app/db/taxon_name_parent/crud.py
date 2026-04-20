import app.db.crud as crud
from app.db.taxon_name_parent.model import TaxonNameParent as TaxonNameParentModel


class TaxonNameParentCrud(crud.Crud):
    model = TaxonNameParentModel
    id_key = "taxon_name_parent_id"
    name = "Taxon name parent"
    search_fields = [
        "taxon_name___scientific_name",
        "parent_taxon_name___scientific_name",
    ]
