import datetime

from app.db.dataimport import DataImportBase
from app.db.kingdom.model import Kingdom as KingdomModel
from app.db.user.model import User as UserModel


class ImportKingdom(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = KingdomModel
        self.upsert_constraint = f"uc_{KingdomModel.__tablename__}_legacy_id"
        self.update_cols = (
            "kingdom_name",
            "kingdom_desc",
            "legacy_id",
            "created_by",
            "updated_by",
            "updated_on",
        )

    def import_row(self, row):
        self.values.append(
            {
                "kingdom_name": row["KINGDOM_NAME"],
                "kingdom_desc": row["KINGDOM_DESC"],
                "legacy_id": row["KINGDOM_ID"],
                "created_by": self.current_user,
                "updated_by": self.map_row_by_unique_key(
                    UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
                ),
                "updated_on": row["UPDATED_ON"] or datetime.datetime.now(),
                "created_on": row["UPDATED_ON"] or datetime.datetime.now(),
            }
        )
