from sqlalchemy import Column, Integer, ForeignKey

from app.db.models import TableMixin
from app.db.session import Base


class Hierarchy(Base, TableMixin):
    __tablename__ = "hierarchy"

    hierarchy_id = Column(Integer, primary_key=True, index=True)
    taxon_name_id = Column(Integer, ForeignKey("taxon_name.taxon_name_id"), nullable=False)
    classification_system_id = Column(Integer, ForeignKey("classification_system.classification_system_id"), index=True)
    parent_nid = Column(Integer, ForeignKey("taxon_name.taxon_name_id"), nullable=False)
