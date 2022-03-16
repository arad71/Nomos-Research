import random
import string

from app.db.dataimport import DataImportBase
from app.db.user.model import User as UserModel


class ImportUser(DataImportBase):
    def import_row(self, row):
        item = {
            "email": row["EMAIL"],
            "is_active": False,
            "is_superuser": False,
            "first_name": self.map_first_name(row["FULL_NAME"]),
            "last_name": self.map_last_name(row["FULL_NAME"]),
            "hashed_password": self.generate_password(),
            # TODO Map these to new data imported? Second parse after importing these tables?
            # "default_kingdom": row["DEFAULT_KINGDOM"],
            # "default_class": row["DEFAULT_CLASS"],
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
