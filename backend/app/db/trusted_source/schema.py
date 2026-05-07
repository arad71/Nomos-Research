from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName
from app.db.trusted_source.constants import (
    ACCESS_DATE,
    NOTES,
    SOURCE_IDENTIFIER,
    SOURCE_URL,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
    TRUSTED_SOURCE_NAME,
)


class TrustedSourceBase(BaseModel):
    taxon_name_id: int = Field(description=TAXON_NAME_ID)
    trusted_source_name: str = Field(description=TRUSTED_SOURCE_NAME)
    source_identifier: Optional[str] = Field(None, description=SOURCE_IDENTIFIER)
    source_url: Optional[str] = Field(None, description=SOURCE_URL)
    access_date: Optional[date] = Field(None, description=ACCESS_DATE)
    notes: Optional[str] = Field(None, description=NOTES)


class TrustedSourceCreate(TrustedSourceBase):
    pass


class TrustedSourceEdit(TrustedSourceBase):
    pass


class TrustedSource(TrustedSourceBase, TableBase):
    trusted_source_id: int
    taxon_name: TaxonName
    deleted: bool

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )
