from app.db.schemas import TableBase


class CitationBase(TableBase):
    taxon_name_id: int
    author_id: int
    author_type: str
    author_order: int


class CitationCreate(CitationBase):
    pass


class CitationEdit(CitationBase):
    pass


class Citation(CitationBase):
    citation_id: int

    class Config:
        orm_mode = True
