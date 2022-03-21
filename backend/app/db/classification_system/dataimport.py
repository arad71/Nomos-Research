from app.db.classification_system.model import (
    ClassificationSystem as ClassificationSystemModel,
)
from app.db.dataimport import DataImportBase
from app.db.user.model import User as UserModel


class ImportClassificationSystem(DataImportBase):
    def import_row(self, row):
        item = {
            "class_desc": row["CLASS_DESC"],
            "class_type": self.map_enum_base(row["CLASS_TYPE"]),
            "preferred": self.map_enum_base(row["PREFERRED"]),
            "sort_order": row["SORT_ORDER"] or None,
            "legacy_id_name": row["CLASS_ID"],
            "created_by": self.current_user,
            "updated_by": self.map_row_by_unique_key(
                UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
            ),
            "updated_on": row["UPDATED_ON"],
        }
        self.insert(
            item,
            ClassificationSystemModel,
            f"uc_{ClassificationSystemModel.__tablename__}_legacy_id",
        )
