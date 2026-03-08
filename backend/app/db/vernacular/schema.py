from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

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
    vernacular_name: str = Field(description=VERNACULAR)
    language: enums.Language = Field(description=LANGUAGE)
    lang_pref: Optional[bool] = Field(None, description=LANG_PREF)
    preferred: Optional[bool] = Field(None, description=PREFERRED)
    source: Optional[str] = Field(None, description=SOURCE)
    sort_order: Optional[int] = None


class VernacularCreate(VernacularBase):
    pass


class VernacularEdit(VernacularBase):
    pass


class Vernacular(VernacularBase, TableBase):
    vernacular_id: int
    taxon_name: TaxonName
    deleted: bool

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )
