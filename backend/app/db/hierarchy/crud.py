import app.db.crud as crud
from app.model import *


class HierarchyCrud(crud.Crud):
    model = Hierarchy
    id_key = "hierarchy_id"
    name = "Hierarchy"
    search_fields = ["parent_name___scientific_name", "taxon_name___scientific_name"]

    @classmethod
    def rebuild(cls):
        return cls.model.rebuild_hierarchy_paths()
