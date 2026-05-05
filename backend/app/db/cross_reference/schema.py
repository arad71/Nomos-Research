from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.db.cross_reference import enums
from app.db.cross_reference.constants import (
    ACTIVE,
    AUTHORISED_BY,
    AUTHORISED_ON,
    COMMENTS,
    CONTRIBUTED_BY,
    CONTRIBUTED_ON,
    CROSS_REFERENCE_ID,
    CROSS_REFERENCE_TYPE,
    EXTERNAL_COMMENTS,
    INTERNAL_COMMENTS,
    NEW_NAME_ID,
    OLD_NAME_ID,
    TABLE_DESCRIPTION,
)
from app.db.publication.schema import Publication
from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName

_ALLOWED_NULL_NEW_NAME_TYPES = {
    enums.CrossReferenceType.excluded_name,
    enums.CrossReferenceType.name_entered_in_error,
}


class CrossReferenceBase(BaseModel):
    old_name_id: int = Field(description=OLD_NAME_ID)
    new_name_id: Optional[int] = Field(None, description=NEW_NAME_ID)
    cross_reference_type: enums.CrossReferenceType = Field(
        description=CROSS_REFERENCE_TYPE
    )
    authorised_yr: Optional[int] = None
    authorised_mn: Optional[int] = None
    authorised_dy: Optional[int] = None
    authorised_by: Optional[str] = Field(None, description=AUTHORISED_BY)
    authorised_on: Optional[datetime] = Field(None, description=AUTHORISED_ON)
    contributed_by: Optional[str] = Field(None, description=CONTRIBUTED_BY)
    contributed_on: Optional[datetime] = Field(None, description=CONTRIBUTED_ON)
    reference_comments: Optional[str] = Field(None, description=COMMENTS)
    internal_comments: Optional[str] = Field(None, description=INTERNAL_COMMENTS)
    external_comments: Optional[str] = Field(None, description=EXTERNAL_COMMENTS)
    notes: Optional[str] = None
    legacy_id: Optional[int] = None
    is_active: bool = Field(True, description=ACTIVE)
    publication_id: Optional[int] = Field(
        None,
        description="Associated publication ID",
    )

    # Cross-field business rules
    @model_validator(mode="after")
    def validate_new_name_and_rationale(self):
        # Rule 1: new_name_id mandatory except for restricted types
        if self.new_name_id is None:
            if self.cross_reference_type not in _ALLOWED_NULL_NEW_NAME_TYPES:
                raise ValueError(
                    "new_name_id is required for the selected cross_reference_type"
                )

            # Rule 2: rationale required when new_name_id is NULL
            if not self.reference_comments or not self.reference_comments.strip():
                raise ValueError(
                    "reference_comments is required when new_name_id is null"
                )

        return self


class CrossReferenceCreate(CrossReferenceBase):
    pass


class CrossReferenceEdit(CrossReferenceBase):
    pass


class CrossReference(CrossReferenceBase, TableBase):
    cross_reference_id: int = Field(description=CROSS_REFERENCE_ID)
    old_name: TaxonName
    new_name: Optional[TaxonName] = None
    publication: Optional[Publication] = None
    deleted: bool

    # class Config:
    #     orm_mode = True
    #     schema_extra = {"description": TABLE_DESCRIPTION}

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )
