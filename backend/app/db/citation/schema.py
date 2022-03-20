from typing import Optional

from pydantic import BaseModel, Field

from app.db.author.schema import Author
from app.db.citation import enums
from app.db.citation.constants import (
    AUTHOR_ORDER,
    AUTHOR_TYPE,
    TABLE_DESCRIPTION,
    TAXON_NAME_ID,
)
from app.db.schemas import TableBase


class CitationBase(BaseModel):
    taxon_name_id: int = Field(description=TAXON_NAME_ID)
    author_id: int
    author_type: enums.AuthorType = Field(description=AUTHOR_TYPE)
    author_order: int = Field(description=AUTHOR_ORDER)
    legacy_id_name: Optional[str]


class CitationCreate(CitationBase):
    pass


class CitationEdit(CitationBase):
    pass


class Citation(CitationBase, TableBase):
    citation_id: int
    author: Author

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
