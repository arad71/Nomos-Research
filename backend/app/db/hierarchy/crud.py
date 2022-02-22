import app.db.crud as crud
from app.db.hierarchy.model import Hierarchy


class HierarchyCrud(crud.Crud):
    model = Hierarchy
    id_key = "hierarchy_id"
    name = "Hierarchy"
