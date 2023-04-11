from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.schema import Index
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
    legacy_id_columns = ["legacy_id_name"]
    __table_args__ = (
        Index(
            f"ix_{__tablename__}_legacy_id_isactive",
            *legacy_id_columns,
            unique=True,
            postgresql_where="deleted = FALSE",
        ),
        {"comment": TABLE_DESCRIPTION},
    )
