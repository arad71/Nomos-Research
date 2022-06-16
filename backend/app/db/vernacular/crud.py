import app.db.crud as crud
from app.db.vernacular.calculated import trigger_taxon_name_calculated_fields
from app.db.vernacular.model import Vernacular


class VernacularCrud(crud.Crud):
    model = Vernacular
    id_key = "vernacular_id"
    name = "Vernacular"

    @classmethod
    def create_item(cls, db, item, current_user):
        vernacular = super().create_item(db, item, current_user=current_user)
        trigger_taxon_name_calculated_fields(db, vernacular)
        db.commit()
        return vernacular
