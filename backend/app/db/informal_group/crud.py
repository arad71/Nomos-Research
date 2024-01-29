import app.db.crud as crud
from app.db.informal_group.model import InformalGroup


class InformalGroupCrud(crud.Crud):
    model = InformalGroup
    id_key = "informal_group_id"
    name = "Informal Group"
    search_fields = [
        "taxon_name___scientific_name",
        "classification_system___class_desc",
    ]
