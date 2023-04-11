from sqlalchemy import Column, Integer, String, func
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property, relationship
from sqlalchemy.schema import Index

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


# https://stackoverflow.com/questions/8289100/create-unique-constraint-with-null-columns
# https://stackoverflow.com/questions/27976683/creating-partial-unique-index-with-sqlalchemy-on-postgres
# https://github.com/sqlalchemy/alembic/issues/750
#


class Author(BaseModel, TableMixin):
    __tablename__ = "author"

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
    legacy_id_columns = ["legacy_id_name"]
    legacy_id_index_string = ",".join(legacy_id_columns)
    full_name = column_property(func.CONCAT_WS(" ", initials, surname))

    __table_args__ = (
        # partial unique index to impose unique constraint only on active records
        # see
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
    def display_name(self):
        if self.surname and self.initials:
            return f"{self.initials} {self.surname}"
        elif self.abbreviation:
            return abbreviation_to_display_name(self.abbreviation)
