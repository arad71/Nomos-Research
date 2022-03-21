from app.db.dataimport import DataImportBase
from app.db.publication.model import Publication as PublicationModel
from app.db.user.model import User as UserModel


class ImportPublication(DataImportBase):
    def import_row(self, row):
        item = {
            "bad_publication": self.map_enum_base(row["BAD_PUBLICATION"]),
            "publication": row["PUBLICATION"],
            "publication_name": row["PUBLICATION_NAME"],
            "legacy_id": row["PUB_ID"],
            "created_by": self.current_user,
            "updated_by": self.map_row_by_unique_key(
                UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
            ),
            "updated_on": row["UPDATED_ON"],
        }
        self.insert(
            item, PublicationModel, f"uc_{PublicationModel.__tablename__}_legacy_id"
        )
