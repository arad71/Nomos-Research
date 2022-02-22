from typing import Optional

from pydantic import BaseModel

from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName


class VernacularBase(BaseModel):
    taxon_name_id: int
    vernacular: str
    language: str
    lang_pref: Optional[str]
    preferred: Optional[str]
    source: Optional[str]
    enabled: str
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
