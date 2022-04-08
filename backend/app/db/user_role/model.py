from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import backref, relationship

from app.db.session import Base


class UserRole(Base):
    __tablename__ = "user_role"
    user_role_id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("user.user_id"),
        nullable=False,
        autoincrement=False,
    )
    role_id = Column(
        Integer,
        ForeignKey("role.role_id"),
        nullable=False,
        autoincrement=False,
    )

    role = relationship(
        "Role", backref=backref("user_role", cascade="all, delete-orphan")
    )
    user = relationship(
        "User", backref=backref("user_role", cascade="all, delete-orphan")
    )

    __table_args__ = (UniqueConstraint("user_id", "role_id", name="unique_user_role"),)
