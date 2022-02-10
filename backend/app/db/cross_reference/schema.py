from app.db.schemas import TableBase


# CrossReference
class CrossReferenceBase(TableBase):
    old_name_id: int
    new_name_id: int
    cross_reference_type: str
    active: str
    authorised_by: str
    comments: str
    notes: str


class CrossReferenceCreate(CrossReferenceBase):
    pass


class CrossReferenceEdit(CrossReferenceBase):
    pass


class CrossReference(CrossReferenceBase):
    cross_reference_id: int

    class Config:
        orm_mode = True
