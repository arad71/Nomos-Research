from app.db.dataimport import DataImportBase
from app.db.kingdom.model import Kingdom
from app.db.taxon_rank.model import TaxonRank as TaxonRankModel
from app.db.user.model import User as UserModel


class ImportTaxonRank(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = TaxonRankModel
        self.upsert_constraint = f"uc_{TaxonRankModel.__tablename__}_legacy_id"
        self.update_cols = (
            "kingdom_id",
            "rank_name",
            "rank_abbrev",
            "direct_parent_rank_id",
            "required_parent_rank_id",
            "legacy_id",
            "created_by",
            "updated_by",
            "updated_on",
        )

    def import_row(self, row):
        mapped_kingdom_id = self.map_row_by_unique_key(
            Kingdom, "legacy_id", row["KINGDOM_ID"], "kingdom_id"
        )
        item = {
            "kingdom_id": mapped_kingdom_id,
            "rank_name": row["RANK_NAME"],
            "rank_abbrev": self.map_enum_base(row["RANK_ABBREV"]),
            "direct_parent_rank_id": self.map_taxon_rank_parent_by_legacy_id(
                row["DIR_PARENT_RID"], mapped_kingdom_id, row["RANK_ID"]
            ),
            "required_parent_rank_id": self.map_taxon_rank_parent_by_legacy_id(
                row["REQ_PARENT_RID"], mapped_kingdom_id, row["RANK_ID"]
            ),
            "legacy_id": row["RANK_ID"],
            "created_by": self.current_user,
            "updated_by": self.map_row_by_unique_key(
                UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
            ),
            "updated_on": row["UPDATED_ON"],
        }

        # We must insert these as we map them due to rows referencing other rows in
        # this table.
        self.insert(
            item, TaxonRankModel, f"uc_{TaxonRankModel.__tablename__}_legacy_id"
        )

    def map_taxon_rank_parent_by_legacy_id(self, legacy_id, kingdom_id, self_id):
        if not legacy_id:
            return None

        if self_id and self_id == legacy_id:
            print("\nWarning: Ignoring self reference.")
            return None

        return self.map_taxon_rank_by_legacy_id(legacy_id, kingdom_id)
