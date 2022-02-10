from app.db.schemas import TableBase


class VernacularBase(TableBase):
    taxon_name_id: int
    vernacular: str
    language: str
    lang_pref: str
    preferred: str
    source: str
    enabled: str
    sort_order: int


class VernacularCreate(VernacularBase):
    pass


class VernacularEdit(VernacularBase):
    pass


class Vernacular(VernacularBase):
    vernacular_id: int

    class Config:
        orm_mode = True
