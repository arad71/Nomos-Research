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
    def rebuild(cls, db: Session):
        cls.model.rebuild_hierarchy_paths(db)

    @classmethod
    def edit_item(
        cls, db: Session, current_user: User, id: int, values: BaseModel
    ) -> Hierarchy:
        hierarchy: Hierarchy = super().edit_item(db, current_user, id, values)
        hierarchy.calculate_path(db=db)
        return hierarchy

    @classmethod
    def create_item(
        cls, db: Session, item: BaseModel, current_user: int = None
    ) -> Hierarchy:
        hierarchy: Hierarchy = super().create_item(db, item, current_user)
        hierarchy.calculate_path(db=db)
        return hierarchy
