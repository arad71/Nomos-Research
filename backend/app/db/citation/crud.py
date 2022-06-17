from sqlalchemy.orm import Session

import app.db.crud as crud
from app.db.citation.calculated import trigger_taxon_name_calculated_fields
from app.db.citation.model import Citation


class CitationCrud(crud.Crud):
    model = Citation
    id_key = "citation_id"
    name = "Citation"

    @classmethod
    def delete_item(cls, db: Session, citation_id: int):
        citation = cls.get_item(db, citation_id)
        taxon_name_id = citation.taxon_name_id
        id_dict = super().delete_item(db, citation_id)
        trigger_taxon_name_calculated_fields(db, taxon_name_id)
        db.commit()
        return id_dict

    @classmethod
    def edit_item(
        cls, db: Session, citation_id: int, values: object, current_user: int
    ):
        citation = super().edit_item(db, citation_id, values, current_user)
        taxon_name_id = citation.taxon_name_id
        trigger_taxon_name_calculated_fields(db, taxon_name_id)
        db.commit()
        return citation
