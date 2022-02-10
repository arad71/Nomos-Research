from sqlalchemy import Column, Integer, String

from app.db.models import TableMixin
from app.db.session import Base


class InformalGroup(Base, TableMixin):
    __tablename__ = "informal_group"

    informal_group_id = Column(String(10), primary_key=True, index=True)
    classification_system_id = Column(Integer, index=True)
    taxon_name_id = Column(Integer)
