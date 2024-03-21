from datetime import datetime
from sqlalchemy import Boolean, Column, Integer, String, TIMESTAMP, Date
from sqlalchemy.schema import Index
from sqlalchemy.types import Enum

from app.db.conservation_code import enums
from app.db.conservation_code.constants import (
    CONSERVATION_CODE_ID,
    CONSERVATION_CODE_DESCRIPTION,
    AUTHORISING_ORG,
    CODE_PRIORITY,
)
from app.db.models import BaseModel, TableMixin


class Conservationcode(BaseModel, TableMixin):
    __tablename__ = "conservation_code"

    conservation_code_id = Column(
        Integer,
        primary_key=True,
        comment=CONSERVATION_CODE_ID,
        doc=CONSERVATION_CODE_ID,
    )
    conservation_code_value = Column(
        String(10), nullable=False, comment=CONSERVATION_CODE_DESCRIPTION, doc=CONSERVATION_CODE_DESCRIPTION
    )
    authorising_org = Column(
        String(100),
        nullable=False,
        comment=AUTHORISING_ORG,
        doc=AUTHORISING_ORG,
    )    
    code_priority = Column(
        String(10),
        nullable=True,
        comment=CODE_PRIORITY,
        doc=CODE_PRIORITY
    )

 
 

    
