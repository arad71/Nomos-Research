from pydantic import BaseModel
from sqlalchemy.orm import Session

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

    @classmethod
    def edit_item(cls, db: Session, current_user: User, id: int,
                  values: object) -> object:
        ret = super().edit_item(db, current_user, id, values)
        hierarchy: Hierarchy = Hierarchy.find(id)
        hierarchy.calculate_path()
        return ret

    @classmethod
    def create_item(cls, db: Session, item: BaseModel, current_user: int = None):
        ret = super().create_item(db, item, current_user)
        hierarchy = Hierarchy.find(ret["hierarchy_id"])
        hierarchy.calculate_path()
        return ret

