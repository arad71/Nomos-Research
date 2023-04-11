from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import Index

from app.db.models import BaseModel, TableMixin
from app.db.user.constants import (
    DEFAULT_CLASS,
    DEFAULT_KINGDOM,
    EMAIL,
    TABLE_DESCRIPTION,
)


class User(BaseModel, TableMixin):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True)
    email = Column(
        String,
        index=True,
        nullable=False,
        comment=EMAIL,
        doc=EMAIL,
    )
    first_name = Column(String)
    last_name = Column(String)
    default_kingdom = Column(Integer, comment=DEFAULT_KINGDOM, doc=DEFAULT_KINGDOM)
    default_class = Column(
        Integer,
        comment=DEFAULT_CLASS,
        doc=DEFAULT_CLASS,
    )
    hashed_password = Column(String, nullable=False)
    legacy_id_name = Column(String())
    legacy_id_columns = ["legacy_id_name"]
    legacy_id_index_string = ",".join(legacy_id_columns)
    __table_args__ = (
        Index(
            f"ix_{__tablename__}_legacy_id_isactive",
            *legacy_id_columns,
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        Index(
            f"ix_{__tablename__}_email_isactive",
            "email",
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        {"comment": TABLE_DESCRIPTION},
    )

    @hybrid_property
    def full_name(self):
        if self.first_name and self.last_name:
            return self.first_name + " " + self.last_name
        return self.email or None

    def has_role(self, role: dict):
        return any(user_role.role.name == role["name"] for user_role in self.user_role)

    def is_super_admin(self):
        return any(user_role.role.name == "SUPER_ADMIN" for user_role in self.user_role)

    @hybrid_property
    def role_names(self):
        return [user_role.role.name for user_role in self.user_role]

    @hybrid_property
    def role_ids(self):
        return [user_role.role.role_id for user_role in self.user_role]
