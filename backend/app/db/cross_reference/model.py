from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text

from app.db.models import TableMixin
from app.db.session import Base


class CrossReference(Base, TableMixin):
    __tablename__ = "cross_reference"

    cross_reference_id = Column(Integer, primary_key=True, index=True)
    old_name_id = Column(Integer, nullable=False)
    new_name_id = Column(Integer)
    cross_reference_type = Column(String(3), nullable=False)
    active = Column(String(1), nullable=False)
    authorised_by = Column(String(60))
    comments = Column(String(1000))
    notes = Column(String(3000))
