from sqlalchemy.orm import Session

import app.db.crud as crud
from app.db.citation.calculated import trigger_taxon_name_calculated_fields
from app.db.citation.model import Citation
from app.db.user.schema import User


class CitationCrud(crud.Crud):
    model = Citation
    id_key = "citation_id"
    name = "Citation"

    @classmethod
    def delete_item(cls, db: Session, current_user: User, citation_id: int):
        citation = cls.get_item(db, current_user, citation_id)
        taxon_name_id = citation.taxon_name_id
        id_dict = super().delete_item(db, current_user, citation_id)
        trigger_taxon_name_calculated_fields(db, taxon_name_id)
        db.commit()
        db.refresh(citation)
        return citation

    @classmethod
    def edit_item(
        cls, db: Session, current_user: User, citation_id: int, values: object
    ):
        citation = super().edit_item(db, current_user, citation_id, values)
        taxon_name_id = citation.taxon_name_id
        trigger_taxon_name_calculated_fields(db, taxon_name_id)
        db.commit()
        return citation

    @classmethod
    def create_item(cls, db: Session, citation, current_user):
        citation = super().create_item(db, citation, current_user=current_user)
        taxon_name_id = citation.taxon_name_id
        trigger_taxon_name_calculated_fields(db, taxon_name_id)
        db.commit()
        return citation
