from typing import Optional

from pydantic import BaseModel

from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName
from app.db.vernacular import enums


class VernacularBase(BaseModel):
    taxon_name_id: int
    vernacular: str
    language: enums.Language
    lang_pref: Optional[enums.LangPref]
    preferred: Optional[enums.Preferred]
    source: Optional[str]
    enabled: enums.Enabled
    sort_order: Optional[int]


class VernacularCreate(VernacularBase):
    pass


class VernacularEdit(VernacularBase):
    pass


class Vernacular(VernacularBase, TableBase):
    vernacular_id: int
    taxon_name: TaxonName

    class Config:
        orm_mode = True
