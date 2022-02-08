import typing as t
from datetime import datetime

from app.db.schemas import TableBase


class KingdomBase(TableBase):
    kingdom_name: str
    kingdom_desc: str


class KingdomCreate(KingdomBase):
    pass


class KingdomEdit(KingdomBase):
    pass


class Kingdom(KingdomBase):
    kingdom_id: int

    class Config:
        orm_mode = True
