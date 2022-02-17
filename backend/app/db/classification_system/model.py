from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base


class ClassificationSystem(Base, TableMixin):
    __tablename__ = "classification_system"

    classification_system_id = Column(Integer, primary_key=True, index=True)
    class_desc = Column(String(200), nullable=False)
    class_type = Column(String(15), nullable=False)
    preferred = Column(String(1))
    sort_order = Column(Integer)
    informal_groups = relationship("InformalGroup", back_populates=__tablename__)
    hierarchies = relationship("Hierarchy", back_populates=__tablename__)
