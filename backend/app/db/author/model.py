from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text

from app.db.session import Base
from app.db.models import TableMixin

class Author(Base, TableMixin):
    __tablename__ = "author"

    author_id = Column(Integer, primary_key=True, index=True)
    author = Column(String(30), nullable=False)
    surname = Column(String(30))
    first_names = Column(String(60))
    initials = Column(String(30))
    orc_id = Column(Integer)
