from app.db.dataimport import DataImportBase
from app.db.taxon_name.model import TaxonName
from app.db.user.model import User as UserModel
from app.db.vernacular.model import Vernacular as VernacularModel


class ImportVernacular(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = VernacularModel
        self.upsert_constraint = f"uc_{VernacularModel.__tablename__}_legacy_id"
        self.update_cols = (
            "taxon_name_id",
            "vernacular",
            "language",
            "lang_pref",
            "preferred",
            "source",
            "enabled",
            "sort_order",
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
                    self.legacy_id_prefix + row["NAME_ID"] if row["NAME_ID"] else "",
                    "taxon_name_id",
                ),
                "vernacular": row["VERNACULAR"],
                "language": self.map_enum_base(row["LANGUAGE"]),
                "lang_pref": self.map_y_n_to_bool(row["LANG_PREF"]),
                "preferred": self.map_y_n_to_bool(row["PREFERRED"]),
                "source": row["SOURCE"],
                "enabled": self.map_y_n_to_bool(row["ENABLED"]),
                "sort_order": row["SORT_ORDER"] or None,
                "created_by": self.current_user,
                "updated_by": self.map_row_by_unique_key(
                    UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
                ),
                "updated_on": row["UPDATED_ON"],
            }
        )
