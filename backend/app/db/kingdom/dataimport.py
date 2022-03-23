from app.db.dataimport import DataImportBase
from app.db.kingdom.model import Kingdom as KingdomModel
from app.db.user.model import User as UserModel


class ImportKingdom(DataImportBase):
    def import_row(self, row):
        item = {
            "kingdom_name": row["KINGDOM_NAME"],
            "kingdom_desc": row["KINGDOM_DESC"],
            "legacy_id": row["KINGDOM_ID"],
            "created_by": self.current_user,
            "updated_by": self.map_row_by_unique_key(
                UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
            ),
            "updated_on": row["UPDATED_ON"],
        }
        self.insert(item, KingdomModel, f"uc_{KingdomModel.__tablename__}_legacy_id")
