#updated for pydantic v2, and added path coercion and serialization to ensure Ltree values are handled correctly in the API layer   
import typing
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, Field,  field_validator, field_serializer

from app.db.classification_system.schema import ClassificationSystem
from app.db.hierarchy.constants import (
    CLASSIFICATION_SYSTEM_ID,
    PARENT_NAME_ID,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
)
from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName


class HierarchyBase(BaseModel):
    taxon_name_id: int = Field(description=TAXON_NAME_ID)
    classification_system_id: int = Field(description=CLASSIFICATION_SYSTEM_ID)
    parent_nid: int = Field(description=PARENT_NAME_ID)


class HierarchyCreate(HierarchyBase):
    pass


class HierarchyEdit(HierarchyBase):
    pass


class LightweightHierarchy(HierarchyBase, TableBase):
    hierarchy_id: int
    scientific_name: str
    rank_name: str
    path: typing.Optional[typing.Any] = None

    # class Config:
    #     orm_mode = True
    #     arbitrary_types_allowed = True
    #     schema_extra = {"description": TABLE_DESCRIPTION}

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )

    @field_validator("path", mode="before")
    @classmethod
    def _coerce_path(cls, v: Any) -> Optional[str]:
        # Accept incoming SQLAlchemy value (Ltree), turn into str early
        if v is None:
            return None
        return str(v)

    @field_serializer("path", when_used="json")
    def _serialize_path(self, v: Optional[str], _info):
        return v

class Hierarchy(LightweightHierarchy):
    hierarchy_id: int
    taxon_name: TaxonName
    parent_name: TaxonName
    classification_system: ClassificationSystem
    formatted_scientific_name: str
    scientific_name: str
    rank_name: str
    path: typing.Optional[typing.Any] = None
    deleted: bool


    @field_validator("path", mode="before")
    @classmethod
    def _coerce_path(cls, v: Any) -> Optional[str]:
        return None if v is None else str(v)

    @field_serializer("path", when_used="json")
    def _serialize_path(self, v: Optional[str], _info):
        return v
