from app.db.author.model import Author
from app.db.citation.model import Citation as CitationModel
from app.db.dataimport import DataImportBase
from app.db.taxon_name.model import TaxonName


class ImportCitation(DataImportBase):
    def import_row(self, row):
        item = {
            "taxon_name_id": self.map_row_by_unique_key(
                TaxonName, "legacy_id", row["NAME_ID"], "taxon_name_id"
            ),
            "author_id": self.map_row_by_unique_key(
                Author, "author", row["AUTHOR"], "author_id"
            ),
            "author_type": self.map_enum_base(row["AUTHOR_TYPE"]),
            "author_order": row["AUTHOR_ORD"],
            "legacy_id_name": row["AUTHOR"],
        }
        self.insert(item, CitationModel, f"uc_{CitationModel.__tablename__}_legacy_id")
