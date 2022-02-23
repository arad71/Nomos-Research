from sqlalchemy import Column, Integer, String
from sqlalchemy.types import Enum

from app.db.classification_system import enums
from app.db.models import TableMixin
from app.db.session import Base


class ClassificationSystem(Base, TableMixin):
    __tablename__ = "classification_system"

    classification_system_id = Column(Integer, primary_key=True, index=True)
    class_desc = Column(String(200), nullable=False)
    class_type = Column(
        Enum(enums.ClassificationType, name=__tablename__ + "__class_type"),
        nullable=False,
    )
    preferred = Column(
        Enum(enums.ClassificationPreferred, name=__tablename__ + "__preferred")
    )
    sort_order = Column(Integer)
