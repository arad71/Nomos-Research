from app.db.dataimport import DataImportBase
from app.db.publication.model import Publication as PublicationModel


class ImportPublication(DataImportBase):
    def import_row(self, row):
        item = {
            "bad_publication": self.map_enum_base(row["BAD_PUBLICATION"]),
            "publication": row["PUBLICATION"],
            "publication_name": row["PUBLICATION_NAME"],
            "legacy_id": row["PUB_ID"],
        }
        self.insert(
            item, PublicationModel, f"uc_{PublicationModel.__tablename__}_legacy_id"
        )
