from app.db.dataimport import DataImportBase
from app.db.kingdom.model import Kingdom
from app.db.taxon_rank.model import TaxonRank as TaxonRankModel
from app.db.user.model import User as UserModel


class ImportTaxonRank(DataImportBase):
    def import_row(self, row):
        item = {
            "kingdom_id": self.map_row_by_unique_key(
                Kingdom, "legacy_id", row["KINGDOM_ID"], "kingdom_id"
            ),
            "rank_name": row["RANK_NAME"],
            "rank_abbrev": self.map_enum_base(row["RANK_ABBREV"]),
            "direct_parent_rank_id": self.map_rank_legacy_id(
                row["DIR_PARENT_RID"], row["RANK_ID"]
            ),
            "required_parent_rank_id": self.map_rank_legacy_id(
                row["REQ_PARENT_RID"], row["RANK_ID"]
            ),
            "legacy_id": row["RANK_ID"],
            "created_by": self.current_user,
            "updated_by": self.map_row_by_unique_key(
                UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
            ),
            "updated_on": row["UPDATED_ON"],
        }

        self.insert(
            item, TaxonRankModel, f"uc_{TaxonRankModel.__tablename__}_legacy_id"
        )

    def map_rank_legacy_id(self, legacy_id, self_id):
        if not legacy_id:
            return None

        if self_id and self_id == legacy_id:
            print("\nWarning: Ignoring self reference.")
            return None

        return self.map_row_by_unique_key(
            TaxonRankModel, "legacy_id", legacy_id, "taxon_rank_id"
        )
