from sqlalchemy import Column, Integer, String

from app.db.models import TableMixin
from app.db.session import Base


class Kingdom(Base, TableMixin):
    __tablename__ = "kingdom"
    __table_args__ = {"comment": "The various kingdoms"}

    kingdom_id = Column(
        Integer, primary_key=True, index=True, comment="The ID of this kingdom"
    )
    kingdom_name = Column(
        String(15), nullable=False, comment="The name of this kingdom"
    )
    kingdom_desc = Column(String(200), comment="A description of this kingdom")
