import random
import string

from app.db.classification_system.model import (
    ClassificationSystem as ClassificationSystemModel,
)
from app.db.dataimport import DataImportBase
from app.db.kingdom.model import Kingdom as KingdomModel
from app.db.user.model import User as UserModel


class ImportUser(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = UserModel
        self.upsert_constraint = f"uc_{UserModel.__tablename__}_legacy_id"
        self.update_cols = (
            "email",
            "is_active",
            "first_name",
            "last_name",
            "hashed_password",
            "legacy_id_name",
            "created_by",
            "created_on",
            "updated_by",
            "updated_on",
        )

    def insert_stub_records(self):
        # Data set currently requires the following stub records to be added
        stub_users = [
            "LOUISEBI",
            "SUEC",
            "KAYEV",
            "EVELYNM",
            "MERIELF",
            # Cross Reference
            "HAMLEY_V",
            "CARROL_S",
            "FALCON_M",
            "VERYAR_K",
            "CURRY_S",
            "WALKER_A",
        ]
        for s in stub_users:
            self.insert(
                {
                    "email": s + "@stub",
                    "is_active": False,
                    "first_name": None,
                    "last_name": None,
                    "hashed_password": self.generate_password(),
                    "legacy_id_name": s,
                    "created_by": 1,
                    "updated_by": 1,
                },
                UserModel,
                f"uc_{UserModel.__tablename__}_legacy_id",
            )

    def row_mapping(self, row):
        return {
            "email": row["EMAIL"],
            "is_active": False,
            "first_name": self.map_first_name(row["FULL_NAME"]),
            "last_name": self.map_last_name(row["FULL_NAME"]),
            "hashed_password": self.generate_password(),
            "legacy_id_name": row["USERNAME"],
            "created_by": self.current_user,
            "updated_by": self.map_row_by_unique_key(
                UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
            ),
            "updated_on": row["UPDATED_ON"],
        }

    def import_row(self, row):
        self.values.append(self.row_mapping(row))

    @staticmethod
    def map_first_name(full_name):
        return full_name.split()[0]

    @staticmethod
    def map_last_name(full_name):
        return " ".join(full_name.split()[1:])

    @staticmethod
    def generate_password():
        return "".join(
            random.SystemRandom().choice(
                string.ascii_lowercase + string.ascii_uppercase + string.digits
            )
            for _ in range(32)
        )


class ImportUserDefaults(ImportUser):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.update_cols = (*self.update_cols, "default_kingdom", "default_class")

    def import_row(self, row):
        item = self.row_mapping(row)
        item["default_kingdom"] = self.map_row_by_unique_key(
            KingdomModel, "legacy_id", row["DEFAULT_KINGDOM"], "kingdom_id"
        )
        item["default_class"] = self.map_row_by_unique_key(
            ClassificationSystemModel,
            "legacy_id_name",
            row["DEFAULT_CLASS"],
            "classification_system_id",
        )
        self.values.append(item)
