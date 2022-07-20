import datetime

from app.db.classification_system.model import ClassificationSystem
from app.db.dataimport import DataImportBase
from app.db.informal_group.model import InformalGroup as InformalGroupModel
from app.db.taxon_name.model import TaxonName
from app.db.user.model import User as UserModel


class ImportInformalGroup(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = InformalGroupModel
        self.upsert_constraint = f"uc_{InformalGroupModel.__tablename__}_legacy_id"
        self.update_cols = (
            "taxon_name_id",
            "classification_system_id",
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
                "classification_system_id": self.map_row_by_unique_key(
                    ClassificationSystem,
                    "legacy_id_name",
                    row["CLASS_ID"],
                    "classification_system_id",
                ),
                "created_by": self.current_user,
                "updated_by": self.map_row_by_unique_key(
                    UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
                ),
                "updated_on": row["UPDATED_ON"] or datetime.datetime.now(),
                "created_on": row["UPDATED_ON"] or datetime.datetime.now(),
            }
        )
