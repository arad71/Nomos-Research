from sqlalchemy import Column, Integer, String, func
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property, relationship
from sqlalchemy.schema import UniqueConstraint

from app.db.author.constants import (
    AUTHOR,
    FIRST_NAMES,
    INITIALS,
    ORC_ID,
    SURNAME,
    TABLE_DESCRIPTION,
)
from app.db.models import BaseModel, TableMixin


def abbreviation_to_display_name(abbreviation):
    abbreviation_has_end_dot = abbreviation.endswith(".")
    abbreviation = abbreviation.strip(".").replace(" ", "")
    display_name = ". ".join(abbreviation.rsplit(".", 1))
    if abbreviation_has_end_dot:
        display_name += "."
    return display_name


class Author(BaseModel, TableMixin):
    __tablename__ = "author"
    __table_args__ = (
        UniqueConstraint("legacy_id_name",
                         "deleted_on",
                         name=f"uc_{ __tablename__}_legacy_id"),
        UniqueConstraint("abbreviation",
                         "deleted_on",
                         name=f"uc_{__tablename__}_abbreviation"),
        {"comment": TABLE_DESCRIPTION},
    )

    author_id = Column(Integer, primary_key=True)
    abbreviation = Column(String(30), nullable=False, comment=AUTHOR)
    surname = Column(String(30), comment=SURNAME, doc=SURNAME)
    first_names = Column(String(60), comment=FIRST_NAMES, doc=FIRST_NAMES)
    initials = Column(String(30), comment=INITIALS, doc=INITIALS)
    orc_id = Column(String(255), comment=ORC_ID, doc=ORC_ID)
    publications = relationship(
        "Publication", secondary="publication_author", back_populates="author"
    )
    legacy_id_name = Column(String())
    full_name = column_property(func.CONCAT_WS(" ", initials, surname))

    @hybrid_property
    def display_name(self):
        if self.surname and self.initials:
            return f"{self.initials} {self.surname}"
        elif self.abbreviation:
            return abbreviation_to_display_name(self.abbreviation)
