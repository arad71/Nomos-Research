from sqlalchemy import Column, Integer, String

from app.db.models import TableMixin
from app.db.session import Base


class Hierarchy(Base, TableMixin):
    __tablename__ = "hierarchy"

    hierarchy_id = Column(Integer, primary_key=True, index=True)
    taxon_name_id = Column(Integer, nullable=False)
    classification_system_id = Column(String(10), nullable=False)
    parent_nid = Column(Integer, nullable=False)
