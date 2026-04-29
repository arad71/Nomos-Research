import app.db.crud as crud
from app.db.trusted_source.model import TrustedSource


class TrustedSourceCrud(crud.Crud):
    model = TrustedSource
    id_key = "trusted_source_id"
    name = "TrustedSource"
    search_fields = [
        "taxon_name___scientific_name",
        "trusted_source_name",
        "source_identifier",
    ]
