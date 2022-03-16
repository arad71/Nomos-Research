from app.db.classification_system.model import (
    ClassificationSystem as ClassificationSystemModel,
)
from app.db.dataimport import DataImportBase


class ImportClassificationSystem(DataImportBase):
    def import_row(self, row):
        item = {
            "class_desc": row["CLASS_DESC"],
            "class_type": self.map_enum_base(row["CLASS_TYPE"]),
            "preferred": self.map_enum_base(row["PREFERRED"]),
            "sort_order": row["SORT_ORDER"] or None,
            "legacy_id_name": row["CLASS_ID"],
        }
        self.insert(
            item,
            ClassificationSystemModel,
            f"uc_{ClassificationSystemModel.__tablename__}_legacy_id",
        )
