import random
import string

from app.db.classification_system.model import (
    ClassificationSystem as ClassificationSystemModel,
)
from app.db.dataimport import DataImportBase
from app.db.kingdom.model import Kingdom as KingdomModel
from app.db.user.model import User as UserModel


class ImportUser(DataImportBase):
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
                    "is_superuser": False,
                    "first_name": None,
                    "last_name": None,
                    "hashed_password": self.generate_password(),
                    "legacy_id_name": s,
                },
                UserModel,
                f"uc_{UserModel.__tablename__}_legacy_id",
            )

    def import_row(self, row):
        item = {
            "email": row["EMAIL"],
            "is_active": False,
            "is_superuser": False,
            "first_name": self.map_first_name(row["FULL_NAME"]),
            "last_name": self.map_last_name(row["FULL_NAME"]),
            "hashed_password": self.generate_password(),
            "legacy_id_name": row["USERNAME"],
        }
        self.insert(item, UserModel, f"uc_{UserModel.__tablename__}_legacy_id")

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


class ImportUserDefaults(DataImportBase):
    def import_row(self, row):
        item = {
            "default_kingdom": self.map_row_by_unique_key(
                KingdomModel, "legacy_id", row["DEFAULT_KINGDOM"], "kingdom_id"
            ),
            "default_class": self.map_row_by_unique_key(
                ClassificationSystemModel,
                "legacy_id_name",
                row["DEFAULT_CLASS"],
                "classification_system_id",
            ),
        }
        self.db.query(UserModel).filter(
            getattr(UserModel, "legacy_id_name") == row["USERNAME"]
        ).update(item)
        self.db.commit()
