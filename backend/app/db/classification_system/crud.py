import app.db.crud as crud
from app.db.classification_system.model import ClassificationSystem


class ClassificationSystemCrud(crud.Crud):
    model = ClassificationSystem
    id_key = "classification_system_id"
    name = "Classification System"
