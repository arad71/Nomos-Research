from app.db.dataimport import DataImportBase
from app.db.publication.model import Publication as PublicationModel
from app.db.user.model import User as UserModel


class ImportPublication(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = PublicationModel
        self.upsert_constraint = f"uc_{PublicationModel.__tablename__}_legacy_id"
        self.update_cols = (
            "bad_publication",
            "publication",
            "publication_name",
            "legacy_id",
            "created_by",
            "updated_by",
            "updated_on",
        )

    def import_row(self, row):
        self.values.append(
            {
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
        )
