from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.db.publication.schema import Publication
from app.db.schemas import TableBase
from app.db.taxon_publication.constants import (
    CROSS_REFERENCE_ID,
    FIGURE_REFERENCE,
    NOTES,
    PAGE_REFERENCE,
    PUBLICATION_ID,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
)


class TaxonPublicationBase(BaseModel):
    taxon_name_id: Optional[int] = Field(default=None, description=TAXON_NAME_ID)
    cross_reference_id: Optional[int] = Field(
        default=None,
        description=CROSS_REFERENCE_ID,
    )
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

    @model_validator(mode="after")
    def validate_single_parent(self):
        has_taxon_name = self.taxon_name_id is not None
        has_cross_reference = self.cross_reference_id is not None
        if has_taxon_name == has_cross_reference:
            raise ValueError(
                "Exactly one of taxon_name_id or cross_reference_id is required"
            )
        return self


class TaxonPublicationCreate(TaxonPublicationBase):
    pass


class TaxonPublicationEdit(TaxonPublicationBase):
    pass


class TaxonPublication(TaxonPublicationBase, TableBase):
    taxon_publication_id: int
    publication: Publication
    deleted: bool

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )
