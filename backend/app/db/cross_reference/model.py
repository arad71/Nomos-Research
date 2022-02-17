from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.models import TableMixin
from app.db.session import Base


class CrossReference(Base, TableMixin):
    __tablename__ = "cross_reference"

    cross_reference_id = Column(Integer, primary_key=True, index=True)
    old_name_id = Column(
        Integer, ForeignKey("cross_reference.cross_reference_id"), nullable=False
    )
    old_name = relationship("TaxonName", back_populates="cross_reference_old_names")
    new_name_id = Column(Integer, ForeignKey("cross_reference.cross_reference_id"))
    new_name = relationship("TaxonName", back_populates="cross_reference_new_names")
    cross_reference_type = Column(String(3), nullable=False)
    active = Column(String(1), nullable=False)
    authorised_by = Column(String(60))
    comments = Column(String(1000))
    notes = Column(String(3000))
