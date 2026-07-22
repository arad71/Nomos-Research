import app.db.crud as crud
from app.db.taxon_name.crud import TaxonNameCrud
from app.db.taxon_name.model import TaxonName
from app.db.taxon_name_parent.model import TaxonNameParent as TaxonNameParentModel


class TaxonNameParentCrud(crud.Crud):
    model = TaxonNameParentModel
    id_key = "taxon_name_parent_id"
    name = "Taxon name parent"
    search_fields = [
        "taxon_name___scientific_name",
        "parent_taxon_name___scientific_name",
    ]

    @classmethod
    def _refresh_child_taxon_name(cls, db, taxon_name_id: int | None) -> None:
        if taxon_name_id is None:
            return

        taxon_name = (
            db.query(TaxonName).filter(TaxonName.taxon_name_id == taxon_name_id).first()
        )
        if not taxon_name:
            return

        TaxonNameCrud._apply_parallel_derived_name_fields(db, taxon_name)
        taxon_name.calculate_name = False
        db.add(taxon_name)
        db.commit()
        db.refresh(taxon_name)

    @classmethod
    def create_item(cls, db, item, current_user=None):
        parent_link = super().create_item(db, item, current_user=current_user)
        cls._refresh_child_taxon_name(db, parent_link.taxon_name_id)
        db.refresh(parent_link)
        return parent_link

    @classmethod
    def edit_item(cls, db, current_user, id: int, values):
        parent_link = super().edit_item(db, current_user, id, values)
        cls._refresh_child_taxon_name(db, parent_link.taxon_name_id)
        db.refresh(parent_link)
        return parent_link

    @classmethod
    def delete_item(cls, db, current_user, id: int, hard: bool = False):
        parent_link = cls.get_item(db, current_user, id)
        taxon_name_id = parent_link.taxon_name_id

        deleted_parent_link = super().delete_item(db, current_user, id, hard)
        cls._refresh_child_taxon_name(db, taxon_name_id)

        if hard:
            return deleted_parent_link

        db.refresh(parent_link)
        return parent_link

    @classmethod
    def undelete_item(cls, db, current_user, id: int):
        parent_link = super().undelete_item(db, current_user, id)
        cls._refresh_child_taxon_name(db, parent_link.taxon_name_id)
        db.refresh(parent_link)
        return parent_link
