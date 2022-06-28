from sqlalchemy.orm import Session

import app.db.crud as crud
from app.db.hierarchy.model import Hierarchy
from app.db.models import BaseModel


class HierarchyCrud(crud.Crud):
    model = Hierarchy
    id_key = "hierarchy_id"
    name = "Hierarchy"

    @classmethod
    def rebuild(cls, db: Session, user_id: int):
        BaseModel.set_session(db)
        ret = cls.model.rebuild_hierarchy_paths()
        return ret
