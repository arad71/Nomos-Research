from enum import Enum

from pydantic import BaseModel

from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName


class Language(str, Enum):
    english = "english"
    indigenous = "indigenous"


class LangPref(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class Preferred(str, Enum):
    y = "y"
    n = "n"
    subf = "subf."


class Enabled(str, Enum):
    y = "y"
    n = "n"


class VernacularBase(BaseModel):
    taxon_name_id: int
    vernacular: str
    language: Language
    lang_pref: LangPref
    preferred: Preferred
    source: str
    enabled: Enabled
    sort_order: int


class VernacularCreate(VernacularBase):
    pass


class VernacularEdit(VernacularBase):
    pass


class Vernacular(VernacularBase, TableBase):
    vernacular_id: int
    taxon_name: TaxonName

    class Config:
        orm_mode = True
