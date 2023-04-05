import datetime

from app.db.classification_system.model import (
    ClassificationSystem as ClassificationSystemModel,
)
from app.db.dataimport import DataImportBase
from app.db.user.model import User as UserModel


class ImportClassificationSystem(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = ClassificationSystemModel
        self.upsert_constraint = (
            f"ix_{ClassificationSystemModel.__tablename__}_legacy_id"
        )
        self.update_cols = (
            "class_desc",
            "class_type",
            "preferred",
            "sort_order",
            "legacy_id_name",
            "created_by",
            "updated_by",
            "updated_on",
        )

    def import_row(self, row):
        self.values.append(
            {
                "class_desc": row["CLASS_DESC"],
                "class_type": self.map_enum_base(row["CLASS_TYPE"]),
                "preferred": self.map_y_n_to_bool(row["PREFERRED"]),
                "sort_order": row["SORT_ORDER"] or None,
                "legacy_id_name": row["CLASS_ID"],
                "created_by": self.current_user,
                "updated_by": self.map_row_by_unique_key(
                    UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
                ),
                "updated_on": row["UPDATED_ON"] or datetime.datetime.now(),
                "created_on": row["UPDATED_ON"] or datetime.datetime.now(),
            }
        )
