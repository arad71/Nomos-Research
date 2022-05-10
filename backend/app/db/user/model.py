from sqlalchemy import Boolean, Column, Integer, String, asc
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import UniqueConstraint

from app.db.models import BaseModel
from app.db.user.constants import (
    DEFAULT_CLASS,
    DEFAULT_KINGDOM,
    EMAIL,
    TABLE_DESCRIPTION,
)


class User(BaseModel):
    __tablename__ = "user"
    __table_args__ = (
        UniqueConstraint("legacy_id_name", name=f"uc_{__tablename__}_legacy_id"),
        {"comment": TABLE_DESCRIPTION},
    )

    user_id = Column(Integer, primary_key=True)
    email = Column(
        String,
        unique=True,
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
    is_active = Column(Boolean, default=True, nullable=False)
    legacy_id_name = Column(String())

    @hybrid_property
    def full_name(self):
        if self.first_name and self.last_name:
            return self.first_name + " " + self.last_name
        return self.email or None

    def has_role(self, role: dict):
        return any(user_role.role.name == role["name"] for user_role in self.user_role)

    @hybrid_property
    def role_names(self):
        return [user_role.role.name for user_role in self.user_role]

    @hybrid_property
    def role_ids(self):
        return [user_role.role.role_id for user_role in self.user_role]
