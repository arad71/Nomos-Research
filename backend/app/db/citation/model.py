from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import Index
from sqlalchemy.types import Enum

from app.db.citation import enums
from app.db.citation.constants import (
    AUTHOR_ORDER,
    AUTHOR_TYPE,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
)
from app.db.models import BaseModel, TableMixin


class Citation(BaseModel, TableMixin):
    __tablename__ = "citation"

    name_plural = "citations"
    citation_id = Column(Integer, primary_key=True)
    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment=TAXON_NAME_ID,
        doc=TAXON_NAME_ID,
    )
    taxon_name = relationship(
        "TaxonName",
        backref=backref(name_plural, lazy="dynamic", cascade="all, delete-orphan"),
    )
    author_id = Column(Integer, ForeignKey("author.author_id"))
    author = relationship(
        "Author", backref=backref(name_plural, cascade="all, delete-orphan")
    )
    author_type = Column(
        Enum(enums.AuthorType, name=__tablename__ + "__author_type"),
        comment=AUTHOR_TYPE,
        doc=AUTHOR_TYPE,
    )
    author_order = Column(
        Integer(),
        comment=AUTHOR_ORDER,
        doc=AUTHOR_ORDER,
    )
    legacy_id_name = Column(String())
    legacy_id_columns = ["legacy_id_name", "taxon_name_id", "author_type"]
    legacy_id_index_string = ",".join(legacy_id_columns)
    __table_args__ = (
        Index(
            f"ix_{__tablename__}_author_id_isactive",
            "author_id",
            "taxon_name_id",
            "author_type",
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        Index(
            f"ix_{__tablename__}_legacy_id_isactive",
            *legacy_id_columns,
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        {"comment": TABLE_DESCRIPTION},
    )
