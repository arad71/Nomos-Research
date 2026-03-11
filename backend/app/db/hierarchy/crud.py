from pydantic import BaseModel
from sqlalchemy.orm import Session

import app.db.crud as crud
from app.db.hierarchy.model import Hierarchy as HierarchyModel  # ORM
from app.db.hierarchy.schema import Hierarchy as HierarchySchema  # Pydantic
from app.model import Hierarchy, User


class HierarchyCrud(crud.Crud):
    model = HierarchyModel
    id_key = "hierarchy_id"
    name = "Hierarchy"
    search_fields = ["taxon_name___scientific_name"]

    @classmethod
    def rebuild(cls, db: Session):
        cls.model.rebuild_hierarchy_paths(db)

    @classmethod
    def edit_item(
        cls, db: Session, current_user: User, id: int, values: BaseModel
    ) -> HierarchyModel:
        hierarchy: HierarchyModel = super().edit_item(db, current_user, id, values)
        hierarchy.calculate_path(db=db)
        return hierarchy

    @classmethod
    def create_item(
        cls, db: Session, item: BaseModel, current_user: int = None
    ) -> HierarchyModel:
        hierarchy: HierarchyModel = super().create_item(db, item, current_user)
        hierarchy.calculate_path(db=db)
        return hierarchy
