from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declared_attr

from app.db.session import Base

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
