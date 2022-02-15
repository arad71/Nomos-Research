from sqlalchemy import Column, Integer, String

from app.db.models import TableMixin
from app.db.session import Base


class Kingdom(Base, TableMixin):
    __tablename__ = "kingdom"

    kingdom_id = Column(Integer, primary_key=True, index=True)
    kingdom_name = Column(String(15), nullable=False)
    kingdom_desc = Column(String(200))
