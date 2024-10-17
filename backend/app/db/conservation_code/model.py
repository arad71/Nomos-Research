# from datetime import datetime


from sqlalchemy import Column, Integer, String  # TIMESTAMP, Boolean,  Date

# from app.db.conservation_code import enums
from app.db.conservation_code.constants import (
    AUTHORISING_ORG,
    CODE_PRIORITY,
    CONSERVATION_CODE_DESCRIPTION,
    CONSERVATION_CODE_ID,
)
from app.db.models import BaseModel, TableMixin

# from sqlalchemy.schema import Index
# from sqlalchemy.types import Enum


class Conservationcode(BaseModel, TableMixin):
    __tablename__ = "conservation_code"

    conservation_code_id = Column(
        Integer,
        primary_key=True,
        comment=CONSERVATION_CODE_ID,
        doc=CONSERVATION_CODE_ID,
    )
    conservation_code_value = Column(
        String(45),
        nullable=False,
        comment=CONSERVATION_CODE_DESCRIPTION,
        doc=CONSERVATION_CODE_DESCRIPTION,
    )
    authorising_org = Column(
        String(100),
        nullable=False,
        comment=AUTHORISING_ORG,
        doc=AUTHORISING_ORG,
    )
    code_priority = Column(
        String(10), nullable=True, comment=CODE_PRIORITY, doc=CODE_PRIORITY
    )
