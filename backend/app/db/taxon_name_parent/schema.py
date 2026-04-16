from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.db.schemas import TableBase
from app.db.taxon_name.schema import TaxonName
from app.db.taxon_name_parent import constants


class TaxonNameParentBase(BaseModel):
    taxon_name_id: int = Field(description=constants.TAXON_NAME_ID)
    parent_taxon_name_id: int = Field(description=constants.PARENT_TAXON_NAME_ID)
    sequence: int = Field(description=constants.SEQUENCE)

    @model_validator(mode="after")
    def _validate_not_self_parent(self) -> "TaxonNameParentBase":
        if self.taxon_name_id == self.parent_taxon_name_id:
            raise ValueError("A taxon name cannot reference itself as a parent")
        return self


class TaxonNameParentCreate(TaxonNameParentBase):
    pass


class TaxonNameParentEdit(TaxonNameParentBase):
    pass


class TaxonNameParent(TaxonNameParentBase, TableBase):
    taxon_name_parent_id: int
    taxon_name: TaxonName
    parent_taxon_name: TaxonName
    deleted: bool

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={"description": constants.TABLE_DESCRIPTION},
    )
