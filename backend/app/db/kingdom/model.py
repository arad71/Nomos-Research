from sqlalchemy import Column, Integer, String
from sqlalchemy.schema import UniqueConstraint

from app.db.kingdom.constants import (
    KINGDOM_DESCRIPTION,
    KINGDOM_ID,
    KINGDOM_NAME,
    TABLE_DESCRIPTION,
)
from app.db.models import BaseModel, TableMixin


class Kingdom(BaseModel, TableMixin):
    __tablename__ = "kingdom"
    __table_args__ = (
        UniqueConstraint("legacy_id",
                         "deleted_on",
                         name=f"uc_{ __tablename__}_legacy_id"),
        {"comment": TABLE_DESCRIPTION},
    )

    kingdom_id = Column(Integer, primary_key=True, comment=KINGDOM_ID, doc=KINGDOM_ID)
    kingdom_name = Column(
        String(15), nullable=False, comment=KINGDOM_NAME, doc=KINGDOM_NAME
    )
    kingdom_desc = Column(
        String(200), comment=KINGDOM_DESCRIPTION, doc=KINGDOM_DESCRIPTION
    )
    legacy_id = Column(Integer, unique=True, index=True)
