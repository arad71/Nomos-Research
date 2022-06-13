from app.db.author.model import Author
from app.db.citation.model import Citation as CitationModel
from app.db.dataimport import DataImportBase
from app.db.taxon_name.model import TaxonName
from app.db.user.model import User as UserModel


class ImportCitation(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = CitationModel
        self.upsert_constraint = f"uc_{CitationModel.__tablename__}_legacy_id"
        self.update_cols = (
            "taxon_name_id",
            "author_id",
            "author_type",
            "author_order",
            "legacy_id_name",
            "created_by",
            "updated_by",
            "updated_on",
        )

    def import_row(self, row):
        self.values.append(
            {
                "taxon_name_id": self.map_row_by_unique_key(
                    TaxonName,
                    "legacy_id",
                    self.legacy_id_prefix + row["NAME_ID"] if row["NAME_ID"] else None,
                    "taxon_name_id",
                ),
                "author_id": self.map_row_by_unique_key(
                    Author, "abbreviation", row["AUTHOR"], "author_id"
                ),
                "author_type": self.map_enum_base(row["AUTHOR_TYPE"]),
                "author_order": row["AUTHOR_ORD"],
                "legacy_id_name": row["AUTHOR"],
                "created_by": self.current_user,
                "updated_by": self.map_row_by_unique_key(
                    UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
                ),
                "updated_on": self.normalise_datetime(
                    self.get_datetime(
                        value=row["UPDATED_ON"], current_format="%Y-%m-%dT%H:%M:%S%z"
                    )
                ),
            }
        )
