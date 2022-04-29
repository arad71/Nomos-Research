from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.schema import UniqueConstraint
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
    __table_args__ = (
        UniqueConstraint(
            "legacy_id_name",
            "taxon_name_id",
            "author_type",
            name=f"uc_{ __tablename__}_legacy_id",
        ),
        {"comment": TABLE_DESCRIPTION},
    )
    name_plural = "citations"

    citation_id = Column(Integer, primary_key=True)
    taxon_name_id = Column(
        Integer,
        ForeignKey("taxon_name.taxon_name_id"),
        comment=TAXON_NAME_ID,
        doc=TAXON_NAME_ID,
    )
    taxon_name = relationship("TaxonName", backref=name_plural)
    author_id = Column(Integer, ForeignKey("author.author_id"))
    author = relationship("Author", backref=name_plural)
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
