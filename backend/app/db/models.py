from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declared_attr

from .session import Base


class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    default_kingdom = Column(Integer)
    default_class = Column(Integer)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)


# See https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/mixins.html
class TableMixin(object):
    @declared_attr
    def updated_by(cls):
        return Column(Integer, ForeignKey('user.user_id'))

    @declared_attr
    def updated_on(cls):
        return Column(DateTime)

    @declared_attr
    def created_by(cls):
        return Column(Integer, ForeignKey('user.user_id'))

    @declared_attr
    def created_on(cls):
        return Column(DateTime)
