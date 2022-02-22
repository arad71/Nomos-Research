import app.db.crud as crud
from app.db.kingdom.model import Kingdom


class KingdomCrud(crud.Crud):
    model = Kingdom
    id_key = "kingdom_id"
    name = "Kingdom"
