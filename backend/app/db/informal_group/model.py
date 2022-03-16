from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.schema import UniqueConstraint

from app.db.informal_group.constants import CLASSIFICATION_SYSTEM_ID, TABLE_DESCRIPTION
from app.db.models import TableMixin
from app.db.session import Base


class InformalGroup(Base, TableMixin):
    __tablename__ = "informal_group"
    __table_args__ = (
        UniqueConstraint(
            "classification_system_id",
            "taxon_name_id",
            name=f"uc_{ __tablename__}_legacy_id",
        ),
        {"comment": TABLE_DESCRIPTION},
    )
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
    taxon_name_id = Column(Integer, ForeignKey("taxon_name.taxon_name_id"))
    taxon_name = relationship("TaxonName", backref=name_plural)
