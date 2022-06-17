import app.db.crud as crud
from app.db.citation.calculated import trigger_taxon_name_calculated_fields
from app.db.citation.model import Citation


class CitationCrud(crud.Crud):
    model = Citation
    id_key = "citation_id"
    name = "Citation"

    @classmethod
    def delete_item(cls, db, citation_id):
        citation = cls.get_item(db, citation_id)
        taxon_name_id = citation.taxon_name_id
        id_dict = super().delete_item(db, citation_id)
        trigger_taxon_name_calculated_fields(db, target=taxon_name_id, crud="delete")
        db.commit()
        return id_dict
