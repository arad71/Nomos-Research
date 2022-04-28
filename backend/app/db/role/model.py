from sqlalchemy import Column, Integer, String, Text

from app.db.models import BaseModel
from app.db.role.constants import TABLE_DESCRIPTION


class Role(BaseModel):
    __tablename__ = "role"
    __table_args__ = {"comment": TABLE_DESCRIPTION}

    role_id = Column(Integer, primary_key=True)
    name = Column(String(100), index=True, nullable=False)
    description = Column(Text)
