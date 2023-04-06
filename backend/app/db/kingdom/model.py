from sqlalchemy import Column, Integer, String
from sqlalchemy.schema import Index

from app.db.kingdom.constants import (
    KINGDOM_DESCRIPTION,
    KINGDOM_ID,
    KINGDOM_NAME,
    TABLE_DESCRIPTION,
)
from app.db.models import BaseModel, TableMixin


class Kingdom(BaseModel, TableMixin):
    __tablename__ = "kingdom"

    kingdom_id = Column(Integer, primary_key=True, comment=KINGDOM_ID, doc=KINGDOM_ID)
    kingdom_name = Column(
        String(15), nullable=False, comment=KINGDOM_NAME, doc=KINGDOM_NAME
    )
    kingdom_desc = Column(
        String(200), comment=KINGDOM_DESCRIPTION, doc=KINGDOM_DESCRIPTION
    )
    legacy_id = Column(Integer, unique=True, index=True)
    legacy_id_columns = ["legacy_id"]
    legacy_id_index_string = ",".join(legacy_id_columns)
    __table_args__ = (
        Index(f"ix_{__tablename__}_legacy_id_isactive",
              *legacy_id_columns,
              unique=True,
              postgresql_where="deleted IS FALSE"),
        {"comment": TABLE_DESCRIPTION},
    )
