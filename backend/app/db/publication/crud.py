import app.db.crud as crud
from app.db.publication.model import Publication


class PublicationCrud(crud.Crud):
    model = Publication
    id_key = "publication_id"
    name = "Publication"
    search_fields = [
        "title",
        "display_title",
    ]
