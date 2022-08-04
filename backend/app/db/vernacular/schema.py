from typing import Optional

from pydantic import BaseModel, Field

from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName
from app.db.vernacular import enums
from app.db.vernacular.constants import (
    LANG_PREF,
    LANGUAGE,
    PREFERRED,
    SOURCE,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
    VERNACULAR,
)


class VernacularBase(BaseModel):
    taxon_name_id: int = Field(description=TAXON_NAME_ID)
    vernacular: str = Field(description=VERNACULAR)
    language: enums.Language = Field(description=LANGUAGE)
    lang_pref: Optional[bool] = Field(description=LANG_PREF)
    preferred: Optional[bool] = Field(description=PREFERRED)
    source: Optional[str] = Field(description=SOURCE)
    sort_order: Optional[int]


class VernacularCreate(VernacularBase):
    pass


class VernacularEdit(VernacularBase):
    pass


class Vernacular(VernacularBase, TableBase):
    vernacular_id: int
    taxon_name: TaxonName
    deleted: bool

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
