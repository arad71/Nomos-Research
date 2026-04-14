from sqlalchemy.orm import Session

import app.db.crud as crud
from app.db.citation.calculated import trigger_taxon_name_calculated_fields
from app.db.taxon_publication.model import TaxonPublication
from app.db.user.schema import User


class TaxonPublicationCrud(crud.Crud):
    model = TaxonPublication
    id_key = "taxon_publication_id"
    name = "TaxonPublication"

    @classmethod
    def delete_item(
        cls,
        db: Session,
        current_user: User,
        link_id: int,
        hard: bool = False,
    ):
        """
        Delete a taxon-publication link and trigger taxon recalculation
        """
        link = cls.get_item(db, current_user, link_id)
        taxon_name_id = link.taxon_name_id

        super().delete_item(db, current_user, link_id, hard)

        trigger_taxon_name_calculated_fields(db, taxon_name_id)
        db.commit()

        if hard:
            return {cls.id_key: link_id}

        db.refresh(link)
        return link

    @classmethod
    def edit_item(
        cls,
        db: Session,
        current_user: User,
        link_id: int,
        values: object,
    ):
        """
        Update page / figure / notes on an existing link
        """
        link = super().edit_item(db, current_user, link_id, values)
        taxon_name_id = link.taxon_name_id

        trigger_taxon_name_calculated_fields(db, taxon_name_id)
        db.commit()

        return link

    @classmethod
    def create_item(
        cls,
        db: Session,
        taxon_publication,
        current_user,
    ):
        """
        Create a new taxon-publication link
        """
        link = super().create_item(
            db,
            taxon_publication,
            current_user=current_user,
        )

        taxon_name_id = link.taxon_name_id
        trigger_taxon_name_calculated_fields(db, taxon_name_id)
        db.commit()

        return link