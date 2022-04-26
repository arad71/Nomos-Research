from app.db.author.model import Author as AuthorModel
from app.db.dataimport import DataImportBase
from app.db.user.model import User as UserModel


class ImportAuthor(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = AuthorModel
        self.upsert_constraint = f"uc_{AuthorModel.__tablename__}_legacy_id"
        self.update_cols = (
            "abbreviation",
            "surname",
            "first_names",
            "initials",
            "legacy_id_name",
            "created_by",
            "updated_by",
            "updated_on",
        )

    def import_row(self, row):
        self.values.append(
            {
                "abbreviation": row["AUTHOR"],
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
        )
