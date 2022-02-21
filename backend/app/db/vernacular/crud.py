import app.db.crud as crud
from app.db.vernacular.model import Vernacular


class VernacularCrud(crud.Crud):
    model = Vernacular
    id_key = "vernacular_id"
    name = "Vernacular"
