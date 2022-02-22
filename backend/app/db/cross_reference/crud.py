import app.db.crud as crud
from app.db.cross_reference.model import CrossReference


class CrossReferenceCrud(crud.Crud):
    model = CrossReference
    id_key = "cross_reference_id"
    name = "Cross Reference"
