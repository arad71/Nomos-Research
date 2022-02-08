from app.db.schemas import TableBase


class VernacularBase(TableBase):
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
    name_id: int

    class Config:
        orm_mode = True
