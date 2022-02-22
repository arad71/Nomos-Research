import app.db.crud as crud
from app.db.informal_group.model import InformalGroup


class InformalGroupCrud(crud.Crud):
    model = InformalGroup
    id_key = "informal_group_id"
    name = "Informal Group"
