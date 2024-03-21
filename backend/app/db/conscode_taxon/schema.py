from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, Field

from app.db.conservation_code.schema import Conservationcode
from app.db.conscode_taxon.constants import (
  CONSERVATION_CODE_ID, 
  NOTES,
  TABLE_DESCRIPTION,
  EFFECTIVE_FROM,
  EFFECTIVE_TO
)
from app.db.schemas import TableBase


class ConscodetaxonBase(BaseModel):
    conservation_code_id: int = Field(description=CONSERVATION_CODE_ID)
    taxon_name_id: int
    notes: Optional[str] = Field(description=NOTES)
    effective_from: Optional[date] = Field(description=EFFECTIVE_FROM)
    effective_to: Optional[date] = Field(description=EFFECTIVE_TO)
    source: Optional[str]


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
