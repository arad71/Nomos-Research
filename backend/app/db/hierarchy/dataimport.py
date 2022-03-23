from app.db.classification_system.model import ClassificationSystem
from app.db.dataimport import DataImportBase
from app.db.hierarchy.model import Hierarchy as HierarchyModel
from app.db.taxon_name.model import TaxonName
from app.db.user.model import User as UserModel


class ImportHierarchy(DataImportBase):
    def import_row(self, row):
        item = {
            "taxon_name_id": self.map_row_by_unique_key(
                TaxonName, "legacy_id", row["NAME_ID"], "taxon_name_id"
            ),
            "classification_system_id": self.map_row_by_unique_key(
                ClassificationSystem,
                "legacy_id_name",
                row["CLASS_ID"],
                "classification_system_id",
            ),
            "parent_nid": self.map_row_by_unique_key(
                TaxonName, "legacy_id", row["PARENT_NID"], "taxon_name_id"
            ),
            "created_by": self.current_user,
            "updated_by": self.map_row_by_unique_key(
                UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
            ),
            "updated_on": row["UPDATED_ON"],
        }
        self.insert(
            item, HierarchyModel, f"uc_{HierarchyModel.__tablename__}_legacy_id"
        )
