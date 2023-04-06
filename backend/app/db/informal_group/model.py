from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import backref, relationship
from sqlalchemy.schema import Index

from app.db.informal_group.constants import CLASSIFICATION_SYSTEM_ID, TABLE_DESCRIPTION
from app.db.models import BaseModel, TableMixin


class InformalGroup(BaseModel, TableMixin):
    __tablename__ = "informal_group"

    name_plural = "informal_groups"
    informal_group_id = Column(Integer, primary_key=True)
    classification_system_id = Column(
        Integer,
        ForeignKey("classification_system.classification_system_id"),
        index=True,
        comment=CLASSIFICATION_SYSTEM_ID,
        doc=CLASSIFICATION_SYSTEM_ID,
    )
    classification_system = relationship("ClassificationSystem", backref=name_plural)
    taxon_name_id = Column(
        Integer, ForeignKey("taxon_name.taxon_name_id"), nullable=False
    )
    taxon_name = relationship(
        "TaxonName",
        foreign_keys=[taxon_name_id],
        backref=backref(name_plural, cascade="all, delete-orphan"),
    )
    legacy_id_columns = ["classification_system_id", "taxon_name_id"]
    legacy_id_index_string = ",".join(legacy_id_columns)
    __table_args__ = (
        Index(f"ix_{__tablename__}_legacy_id_isactive",
              *legacy_id_columns,
              unique=True,
              postgresql_where="deleted = FALSE"),
        {"comment": TABLE_DESCRIPTION},
    )
