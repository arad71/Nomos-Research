from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base


class Author(Base, TableMixin):
    __tablename__ = "author"
    author_id = Column(Integer, primary_key=True, index=True)
    author = Column(String(30), nullable=False)
    surname = Column(String(30))
    first_names = Column(String(60))
    initials = Column(String(30))
    orc_id = Column(String(255))
    publications = relationship(
        "Publication", secondary="publication_author", back_populates="author"
    )
