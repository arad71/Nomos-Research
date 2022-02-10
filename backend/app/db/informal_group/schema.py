from app.db.schemas import TableBase


class InformalGroupBase(TableBase):
    classification_system_id: str
    taxon_name_id: int


class InformalGroupCreate(InformalGroupBase):
    pass


class InformalGroupEdit(InformalGroupBase):
    pass


class InformalGroup(InformalGroupBase):
    informal_group_id: str

    class Config:
        orm_mode = True
