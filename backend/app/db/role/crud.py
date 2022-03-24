from fastapi import HTTPException
from sqlalchemy.orm import Session

import app.db.crud as crud
from app.db.role.model import Role


class RoleCrud(crud.Crud):
    model = Role
    id_key = "role_id"
    name = "Role"

    @classmethod
    def get_by_name(cls, db: Session, name: str):
        return cls.get_by_property(db, "name", name)
