# from datetime import datetime
from datetime import date
from typing import Optional

from pydantic import BaseModel, Field

from app.db.conscode_taxon.constants import (
    CONSERVATION_CODE_ID,
    EFFECTIVE_FROM,
    EFFECTIVE_TO,
    ISACTIVE,
    NOTES,
    TABLE_DESCRIPTION,
)

# from app.db.conservation_code.schema import Conservationcode
from app.db.schemas import TableBase


class ConscodetaxonBase(BaseModel):
    conservation_code_id: int = Field(description=CONSERVATION_CODE_ID)
    taxon_name_id: int
    notes: Optional[str] = Field(description=NOTES)
    effective_from: Optional[date] = Field(description=EFFECTIVE_FROM)
    effective_to: Optional[date] = Field(description=EFFECTIVE_TO)
    source: Optional[str]
    isactive: Optional[bool] = Field(description=ISACTIVE)


class ConscodetaxonCreate(ConscodetaxonBase):
    pass


class ConscodetaxonEdit(ConscodetaxonBase):
    pass


class Conscodetaxon(ConscodetaxonBase, TableBase):
    conscode_taxon_id: int
    # conservation_code: Conservationcode
    deleted: bool
    source: str

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
