from sqlalchemy import Column, Integer, String

from app.db.models import TableMixin
from app.db.session import Base


class Citation(Base, TableMixin):
    __tablename__ = "citation"

    citation_id = Column(Integer, primary_key=True, index=True)
    taxon_name_id = Column(Integer())
    author_id = Column(Integer())
    author_type = Column(String())
    author_order = Column(Integer())
