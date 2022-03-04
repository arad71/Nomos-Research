from sqlalchemy import Boolean, Column, Integer, String

from app.db.session import Base


class User(Base):
    __tablename__ = "user"
    __table_args__ = {"comment": "A list of users and their access rights"}

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    default_kingdom = Column(Integer)
    default_class = Column(Integer)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
