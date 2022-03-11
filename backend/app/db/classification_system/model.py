from sqlalchemy import Column, Integer, String
from sqlalchemy.types import Enum

from app.db.classification_system import enums
from app.db.classification_system.constants import *
from app.db.models import TableMixin
from app.db.session import Base


class ClassificationSystem(Base, TableMixin):
    __tablename__ = "classification_system"
    __table_args__ = {"comment": TABLE_DESCRIPTION}

    classification_system_id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment=CLASSIFICATION_SYSTEM_ID,
        doc=CLASSIFICATION_SYSTEM_ID,
    )
    class_desc = Column(
        String(200), nullable=False, comment=DESCRIPTION, doc=DESCRIPTION
    )
    class_type = Column(
        Enum(enums.ClassificationType, name=__tablename__ + "__class_type"),
        nullable=False,
        comment=CLASS_TYPE,
        doc=CLASS_TYPE,
    )
    preferred = Column(
        Enum(enums.ClassificationPreferred, name=__tablename__ + "__preferred"),
        comment=PREFERRED,
        doc=PREFERRED,
    )
    sort_order = Column(Integer, comment=SORT_ORDER, doc=SORT_ORDER)
