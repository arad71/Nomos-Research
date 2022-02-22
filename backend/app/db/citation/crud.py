import app.db.crud as crud
from app.db.citation.model import Citation


class CitationCrud(crud.Crud):
    model = Citation
    id_key = "citation_id"
    name = "Citation"
