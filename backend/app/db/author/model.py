from sqlalchemy import Column, Date, Integer, String, func
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property, relationship
from sqlalchemy.schema import Index

from app.db.author.constants import (
    AUTHOR,
    DISCIPLINE,
    EFFECTIVE_FROM,
    EFFECTIVE_TO,
    FIRST_NAMES,
    INITIALS,
    ORC_ID,
    SURNAME,
    TABLE_DESCRIPTION,
)
from app.db.models import BaseModel, TableMixin


def abbreviation_to_display_name(abbreviation: str) -> str:
    """
    1. Removes leading and trailing white space
    2. Does not alter a trailing full-stop
    2. Replaces multiple spaces with single space if present
    3. Removes spaces after full-stops in the abbreviation, except the last full-stop
    """
    display_name = abbreviation
    display_name = display_name.strip().strip(".")
    display_name = " ".join([s for s in display_name.split(" ") if s])
    display_name = display_name.replace(". ", ".")
    display_name = ". ".join(display_name.rsplit(".", 1))
    if abbreviation.strip().endswith("."):
        display_name += "."
    return display_name


class Author(BaseModel, TableMixin):
    __tablename__ = "author"

    author_id = Column(Integer, primary_key=True)
    abbreviation = Column(String(30), nullable=False, comment=AUTHOR)
    surname = Column(String(30), comment=SURNAME, doc=SURNAME)
    first_names = Column(String(60), comment=FIRST_NAMES, doc=FIRST_NAMES)
    initials = Column(String(30), comment=INITIALS, doc=INITIALS)
    orc_id = Column(String(255), comment=ORC_ID, doc=ORC_ID)
    discipline = Column(String(255), comment=DISCIPLINE, doc=DISCIPLINE)
    effective_from = Column(Date, comment=EFFECTIVE_FROM, doc=EFFECTIVE_FROM)
    effective_to = Column(Date, comment=EFFECTIVE_TO, doc=EFFECTIVE_TO)
    publications = relationship(
        "Publication", secondary="publication_author", back_populates="author"
    )
    legacy_id_name = Column(String())
    legacy_id_columns = ["legacy_id_name"]
    full_name = column_property(func.CONCAT_WS(" ", initials, surname))

    __table_args__ = (
        Index(
            f"ix_{__tablename__}_legacy_id_isactive",
            *legacy_id_columns,
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        Index(
            f"ix_{__tablename__}_abbreviation_isactive",
            "abbreviation",
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        {"comment": TABLE_DESCRIPTION},
    )

    @hybrid_property
    def display_name(self) -> str:
        """Return the display name according to specific rules

        When Surname and Initials both exist, return "Initials Surname" with leading and
        trailing whitespace removed from each element, and a single space between the
        two elements.

        When either Surname or Initials are absent, apply formatting rules to the
        abbreviation element and return the result.
        """
        if self.surname and self.initials:
            return f"{self.initials.strip()} {self.surname.strip()}"
        elif self.abbreviation:
            return abbreviation_to_display_name(self.abbreviation)
