from app.db.schemas import TableBase


class HierarchyBase(TableBase):
    taxon_name_id: int
    classification_system_id: int
    parent_nid: int
    pass


class HierarchyCreate(HierarchyBase):
    pass


class HierarchyEdit(HierarchyBase):
    pass


class Hierarchy(HierarchyBase):
    hierarchy_id: int

    class Config:
        orm_mode = True
