from sqlalchemy.orm import Session

import app.db.crud as crud
from app.db.conservation_code.calculated import trigger_taxon_name_calculated_fields
from app.db.conservation_code.model import Conservationcode
from app.db.user.schema import User


class ConservationcodeCrud(crud.Crud):
    model = Conservationcode
    id_key = "conservation_code_id"
    name = "Conservation code"
    search_fields = ["conservation_code_value", "authorising_org", "code_priority"]

    @classmethod
    def delete_item(
        cls,
        db: Session,
        current_user: User,
        conservation_code_id: int,
        hard: bool = False,
    ):
        conservation_code = cls.get_item(db, current_user, conservation_code_id)
        # taxon_name_id = citation.taxon_name_id
        super().delete_item(db, current_user, conservation_code_id, hard)
        trigger_taxon_name_calculated_fields(db, conservation_code_id)
        db.commit()
        if hard:
            return {cls.id_key: conservation_code_id}
        db.refresh(conservation_code)
        return conservation_code
