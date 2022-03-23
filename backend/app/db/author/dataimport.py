from app.db.author.model import Author as AuthorModel
from app.db.dataimport import DataImportBase
from app.db.user.model import User as UserModel


class ImportAuthor(DataImportBase):
    def import_row(self, row):
        item = {
            "author": row["AUTHOR"],
            "surname": row["SURNAME"],
            "first_names": row["FIRST_NAMES"],
            "initials": row["INITIALS"],
            "legacy_id_name": row["AUTHOR"],
            "created_by": self.current_user,
            "updated_by": self.map_row_by_unique_key(
                UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
            ),
            "updated_on": row["UPDATED_ON"],
        }
        self.insert(item, AuthorModel, f"uc_{AuthorModel.__tablename__}_legacy_id")
