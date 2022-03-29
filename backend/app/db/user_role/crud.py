import app.db.crud as crud
from app.db.user_role.model import UserRole


class UserRoleCrud(crud.Crud):
    model = UserRole
    id_key = "user_role_id"
    name = "UserRole"

    @classmethod
    def get_by_user_id(cls, db, user_id):
        return cls.get_by_property(db, "user_id", user_id)

    @classmethod
    def get_by_ids(cls, db, user_id, role_id):
        return (
            db.query(cls.model).filter({"user_id": user_id, "role_id": role_id}).first()
        )

    @classmethod
    def delete_by_ids(cls, db, user_id, role_id):
        db.delete(cls.model).filter({"user_id": user_id, "role_id": role_id}).first()
        db.commit()
