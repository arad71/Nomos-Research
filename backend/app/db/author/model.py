from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base


class Author(Base, TableMixin):
    __tablename__ = "author"
    __table_args__ = {"comment": "A list of all validly recognised authors."}

    author_id = Column(Integer, primary_key=True, index=True)
    author = Column(
        String(30),
        nullable=False,
        comment="Standard Brummit and Powell abbreviation for this author",
    )
    surname = Column(String(30), comment="Surname of author")
    first_names = Column(String(60), comment="First names of author")
    initials = Column(String(30), comment="Author initials (excluding surname)")
    orc_id = Column(String(255), comment="Open Researcher and Contributor ID.")
    publications = relationship(
        "Publication", secondary="publication_author", back_populates="author"
    )
