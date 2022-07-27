from sqlalchemy.orm import Session

import app.db.crud as crud
import app.db.taxon_name.schema as schema
from app.db.informal_group.model import InformalGroup
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
    def create_item(
        cls,
        db: Session,
        taxon_name: schema.TaxonNameCreate,
        current_user: int = None,
    ) -> TaxonName:
        create_data = taxon_name.dict(exclude_unset=True)
        delattr(taxon_name, "classification_system_ids")
        db_taxon_name = super().create_item(db, taxon_name, current_user=current_user)
        if (
            "classification_system_ids" in create_data
            and create_data["classification_system_ids"]
        ):
            for classification_system_id in create_data["classification_system_ids"]:
                informal_group = InformalGroup(
                    classification_system_id=classification_system_id,
                    taxon_name_id=db_taxon_name.taxon_name_id,
                    created_by=current_user,
                    updated_by=current_user,
                )
                db.add(informal_group)
            db.commit()
        return db_taxon_name

    @classmethod
    def edit_item(
        cls,
        db: Session,
        current_user: int,
        taxon_name_id: int,
        taxon_name: schema.TaxonNameEdit,
        **kwargs,
    ) -> TaxonName:
        update_data = taxon_name.dict(exclude_unset=True)
        if "classification_system_ids" in update_data:
            classification_system_ids = update_data["classification_system_ids"]
            db.query(InformalGroup).filter(
                InformalGroup.taxon_name_id == taxon_name_id,
                ~InformalGroup.classification_system_id.in_(classification_system_ids),
            ).delete()
            current_classification_system_ids = [
                classification_system_id[0]
                for classification_system_id in db.query(
                    InformalGroup.classification_system_id
                )
                .filter(InformalGroup.taxon_name_id == taxon_name_id)
                .all()
            ]
            new_classification_system_ids = set(classification_system_ids) ^ set(
                current_classification_system_ids
            )
            for classification_system_id in new_classification_system_ids:
                informal_group = InformalGroup(
                    taxon_name_id=taxon_name_id,
                    classification_system_id=classification_system_id,
                    created_by=current_user,
                    updated_by=current_user,
                )
                db.add(informal_group)
            db.commit()
            delattr(taxon_name, "classification_system_ids")
        db_taxon_name = super().edit_item(db, current_user, taxon_name_id, taxon_name)
        return db_taxon_name
