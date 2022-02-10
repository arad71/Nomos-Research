from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declared_attr

from app.db.session import Base
from app.db.models import TableMixin


class ClassificationSystem(Base, TableMixin):
    __tablename__ = "classification_system"

    classification_system_id = Column(String(10), primary_key=True, index=True)
    class_desc = Column(String(200), nullable=False)
    class_type = Column(String(15), nullable=False)
    preferred = Column(String(1))
    sort_order = Column(Integer)
