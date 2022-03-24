from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base


class UserRole(Base):
    __tablename__ = "user_role"
    user_id = Column(
        Integer,
        ForeignKey("user.user_id"),
        primary_key=True,
        nullable=False,
    )
    role_id = Column(
        Integer,
        ForeignKey("role.role_id"),
        primary_key=True,
        nullable=False,
    )

    role = relationship("Role", backref="user_role")
    user = relationship("User", backref="user_role")

    __table_args__ = (UniqueConstraint("user_id", "role_id", name="unique_user_role"),)
