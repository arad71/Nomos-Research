from pydantic import BaseModel

from app.db.schemas import TableBase


class KingdomBase(BaseModel):
    kingdom_name: str
    kingdom_desc: str


class KingdomCreate(KingdomBase):
    pass


class KingdomEdit(KingdomBase):
    pass


class Kingdom(KingdomBase, TableBase):
    kingdom_id: int

    class Config:
        orm_mode = True
