from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.author.constants import (
    AUTHOR,
    FIRST_NAMES,
    INITIALS,
    ORC_ID,
    SURNAME,
    TABLE_DESCRIPTION,
)
from app.db.models import TableMixin
from app.db.session import Base


class Author(Base, TableMixin):
    __tablename__ = "author"
    __table_args__ = {"comment": TABLE_DESCRIPTION}

    author_id = Column(Integer, primary_key=True)
    author = Column(
        String(30),
        nullable=False,
        comment=AUTHOR,
    )
    surname = Column(String(30), comment=SURNAME, doc=SURNAME)
    first_names = Column(String(60), comment=FIRST_NAMES, doc=FIRST_NAMES)
    initials = Column(String(30), comment=INITIALS, doc=INITIALS)
    orc_id = Column(String(255), comment=ORC_ID, doc=ORC_ID)
    publications = relationship(
        "Publication", secondary="publication_author", back_populates="author"
    )
