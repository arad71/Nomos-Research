from app.db.dataimport import DataImportBase
from app.db.kingdom.model import Kingdom as KingdomModel


class ImportKingdom(DataImportBase):
    def import_row(self, row):
        item = {
            "kingdom_name": row["KINGDOM_NAME"],
            "kingdom_desc": row["KINGDOM_DESC"],
            "legacy_id": row["KINGDOM_ID"],
            "created_by": self.current_user,
            "updated_by": self.current_user,
        }
        self.insert(item, KingdomModel, f"uc_{KingdomModel.__tablename__}_legacy_id")
