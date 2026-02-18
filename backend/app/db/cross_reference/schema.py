from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.db.cross_reference import enums
from app.db.cross_reference.constants import (
    AUTHORISED_BY,
    COMMENTS,
    CROSS_REFERENCE_ID,
    CROSS_REFERENCE_TYPE,
    NEW_NAME_ID,
    OLD_NAME_ID,
    TABLE_DESCRIPTION,
)
from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName


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
    reference_comments: Optional[str] = Field(None, description=COMMENTS)
    notes: Optional[str] = None
    legacy_id: Optional[int] = None


class CrossReferenceCreate(CrossReferenceBase):
    pass


class CrossReferenceEdit(CrossReferenceBase):
    pass


class CrossReference(CrossReferenceBase, TableBase):
    cross_reference_id: int = Field(description=CROSS_REFERENCE_ID)
    old_name: TaxonName
    new_name: Optional[TaxonName] = None
    deleted: bool

    # class Config:
    #     orm_mode = True
    #     schema_extra = {"description": TABLE_DESCRIPTION}

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )
