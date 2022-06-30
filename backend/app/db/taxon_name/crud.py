from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.crud as crud
from app.db.taxon_name.model import TaxonName
from app.db.user.schema import User


class TaxonNameCrud(crud.Crud):
    model = TaxonName
    id_key = "taxon_name_id"
    name = "Taxon Name"
    search_fields = [
        "scientific_name",
        "author",
        "all_vernaculars",
        "phylum",
        "taxon_class",
        "order",
        "family",
        "cross_referenced_old_name___new_name___scientific_name",
    ]

    @classmethod
    def delete_item(cls, db: Session, current_user: User, id: int):
        item = cls.get_item(db, current_user, id)
        if not item:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail=cls.name + " not found"
            )
        item.deleted = True
        item.updated_by = current_user.user_id
        db.commit()
        db.refresh(item)
        return item
