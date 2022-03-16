from app.db.author.model import Author as AuthorModel
from app.db.dataimport import DataImportBase


class ImportAuthor(DataImportBase):
    def import_row(self, row):
        item = {
            "author": row["AUTHOR"],
            "surname": row["SURNAME"],
            "first_names": row["FIRST_NAMES"],
            "initials": row["INITIALS"],
            "orc_id": "",
            "legacy_id_name": row["AUTHOR"],
        }
        self.insert(item, AuthorModel, f"uc_{AuthorModel.__tablename__}_legacy_id")
