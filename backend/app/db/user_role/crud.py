import app.db.crud as crud
from app.db.user_role.model import UserRole


class UserRoleCrud(crud.Crud):
    model = UserRole
    id_key = "role_id"
    name = "Role"

    @classmethod
    def get_by_user_id(cls, db, user_id):
        return cls.get_by_property(db, "user_id", user_id)
