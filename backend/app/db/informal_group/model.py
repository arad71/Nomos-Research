from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declared_attr

from app.db.session import Base
from app.db.models import TableMixin


class InformalGroup(Base, TableMixin):
    __tablename__ = "informal_group"

    informal_group_id = Column(String(10), primary_key=True, index=True)
    class_id = Column(String(10))
    name_id = Column(Integer)
