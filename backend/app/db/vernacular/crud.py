import app.db.crud as crud
from app.db.vernacular.calculated import trigger_taxon_name_calculated_fields
from app.db.vernacular.model import Vernacular


class VernacularCrud(crud.Crud):
    model = Vernacular
    id_key = "vernacular_id"
    name = "Vernacular"
    search_fields = ["taxon_name___scientific_name", "vernacular_name"]

    @classmethod
    def create_item(cls, db, item, current_user):
        vernacular = super().create_item(db, item, current_user=current_user)
        trigger_taxon_name_calculated_fields(db, vernacular)
        db.commit()
        return vernacular

    @classmethod
    def delete_item(cls, db, current_user, vernacular_id, hard: bool = False):
        vernacular = db.query(Vernacular).get(vernacular_id)
        super().delete_item(db, current_user, vernacular_id, hard)
        trigger_taxon_name_calculated_fields(db, vernacular)
        db.commit()
        if hard:
            return {cls.id_key: vernacular_id}
        db.refresh(vernacular)
        return vernacular
