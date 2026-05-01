from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.db.schemas import TableBase
from app.db.taxon_publication.constants import (
    FIGURE_REFERENCE,
    NOTES,
    PAGE_REFERENCE,
    PUBLICATION_ID,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
)


class TaxonPublicationBase(BaseModel):
    taxon_name_id: int = Field(description=TAXON_NAME_ID)
    publication_id: int = Field(description=PUBLICATION_ID)

    page_reference: Optional[str] = Field(
        default=None,
        description=PAGE_REFERENCE,
    )
    figure_reference: Optional[str] = Field(
        default=None,
        description=FIGURE_REFERENCE,
    )
    notes: Optional[str] = Field(
        default=None,
        description=NOTES,
    )


class TaxonPublicationCreate(TaxonPublicationBase):
    pass


class TaxonPublicationEdit(TaxonPublicationBase):
    pass


class TaxonPublication(TaxonPublicationBase, TableBase):
    taxon_publication_id: int
    deleted: bool

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )
