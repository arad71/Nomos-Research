from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declared_attr

from app.db.session import Base
from app.db.models import TableMixin


class Hierarchy(Base, TableMixin):
    __tablename__ = "hierarchy"

    hierarchy_id = Column(Integer, primary_key=True, index=True)
    name_id = Column(Integer, nullable=False)
    classification_id = Column(String(10), nullable=False)
    parent_nid = Column(Integer, nullable=False)
