from fastapi import HTTPException, status
from sqlalchemy.orm import Session, undefer

import app.db.crud as crud
from app.db.taxon_name.model import TaxonName


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
    def delete_item(cls, db: Session, id: int):
        item = cls.get_item(db, id)
        if not item:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail=cls.name + " not found"
            )
        db.query(TaxonName).filter(TaxonName.taxon_name_id == id).options(
            undefer("canonical_name_without_rank")
        ).delete()
        db.commit()
