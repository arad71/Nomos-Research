from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.types import Enum

from app.db.classification_system import enums
from app.db.classification_system.constants import (
    CLASS_TYPE,
    CLASSIFICATION_SYSTEM_ID,
    DESCRIPTION,
    PREFERRED,
    SORT_ORDER,
    TABLE_DESCRIPTION,
)
from app.db.models import BaseModel, TableMixin


class ClassificationSystem(BaseModel, TableMixin):
    __tablename__ = "classification_system"
    __table_args__ = (
        UniqueConstraint("legacy_id_name",
                         "deleted_on",
                         name=f"uc_{ __tablename__}_legacy_id"),
        {"comment": TABLE_DESCRIPTION},
    )

    classification_system_id = Column(
        Integer,
        primary_key=True,
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
        Boolean,
        comment=PREFERRED,
        doc=PREFERRED,
    )
    sort_order = Column(Integer, comment=SORT_ORDER, doc=SORT_ORDER)
    legacy_id_name = Column(String())
