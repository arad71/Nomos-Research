from pydantic import BaseModel, Field

from app.db.author.schema import Author
from app.db.citation import enums
from app.db.citation.constants import *
from app.db.schemas import TableBase


class CitationBase(BaseModel):
    taxon_name_id: int = Field(description=TAXON_NAME_ID)
    author_id: int
    author_type: enums.AuthorType = Field(description=AUTHOR_TYPE)
    author_order: int = Field(description=AUTHOR_ORDER)


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
