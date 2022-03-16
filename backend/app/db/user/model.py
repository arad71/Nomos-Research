from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.schema import UniqueConstraint

from app.db.session import Base
from app.db.user.constants import (
    DEFAULT_CLASS,
    DEFAULT_KINGDOM,
    EMAIL,
    TABLE_DESCRIPTION,
)


class User(Base):
    __tablename__ = "user"
    __table_args__ = (
        UniqueConstraint("legacy_id_name", name=f"uc_{ __tablename__}_legacy_id"),
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
    is_superuser = Column(Boolean, default=False, nullable=False)
    legacy_id_name = Column(String())
