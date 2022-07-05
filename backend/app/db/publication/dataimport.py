from app.db.dataimport import DataImportBase
from app.db.publication.model import Publication as PublicationModel
from app.db.user.model import User as UserModel


class ImportPublication(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = PublicationModel
        self.upsert_constraint = f"uc_{PublicationModel.__tablename__}_legacy_id"
        self.update_cols = (
            "abbreviated_title",
            "title",
            "legacy_id",
            "created_by",
            "updated_by",
            "updated_on",
            "deleted",
        )

    def import_row(self, row):
        self.values.append(
            {
                "deleted": self.map_y_n_to_bool(row["BAD_PUBLICATION"]) or False,
                "abbreviated_title": row["PUBLICATION"],
                "title": row["PUBLICATION_NAME"],
                "legacy_id": row["PUB_ID"],
                "created_by": self.current_user,
                "updated_by": self.map_row_by_unique_key(
                    UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
                ),
                "updated_on": row["UPDATED_ON"],
            }
        )
