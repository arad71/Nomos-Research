from app.db.cross_reference.model import CrossReference as CrossReferenceModel
from app.db.dataimport import DataImportBase
from app.db.taxon_name.model import TaxonName


class ImportCrossReference(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = CrossReferenceModel
        self.upsert_constraint = f"uc_{CrossReferenceModel.__tablename__}_legacy_id"
        self.update_cols = (
            "old_name_id",
            "new_name_id",
            "cross_reference_type",
            "active",
            "authorised_date",
            "authorised_by",
            "comments",
            "notes",
            "legacy_id",
            "created_by",
            "created_on",
            "updated_by",
            "updated_on",
        )

    def import_row(self, row):
        self.values.append(
            {
                "old_name_id": self.map_row_by_unique_key(
                    TaxonName, "legacy_id", row["OLD_NAME_ID"], "taxon_name_id"
                ),
                "new_name_id": self.map_row_by_unique_key(
                    TaxonName, "legacy_id", row["NEW_NAME_ID"], "taxon_name_id"
                ),
                "cross_reference_type": self.map_cross_reference_type_enum(
                    row["XREF_TYPE"]
                ),
                "active": self.map_y_n_to_bool(row["ACTIVE"]),
                "authorised_date": self.map_authorised_date(row),
                "authorised_by": row["AUTHORISED_BY"],
                "comments": row["COMMENTS"],
                "notes": row["NOTES"],
                "legacy_id": row["XREF_ID"],
                "created_by": self.map_user_or_default(row["ADDED_BY"]),
                "created_on": row["ADDED_ON"] or None,
                "updated_by": self.map_user_or_default(row["UPDATED_BY"]),
                "updated_on": row["UPDATED_ON"] or None,
            }
        )

    @staticmethod
    def map_authorised_date(row):
        # TODO some data has year only, can this database field type support this? How to handle?
        if (
            not row["AUTHORISED_YR"]
            or not row["AUTHORISED_MN"]
            or not row["AUTHORISED_DY"]
        ):
            if row["AUTHORISED_YR"] or row["AUTHORISED_MN"] or row["AUTHORISED_DY"]:
                print(
                    f"\nSkipping Authorised date. Unable to map- AUTHORISED_YR: {row['AUTHORISED_YR']} AUTHORISED_MN: {row['AUTHORISED_MN']} AUTHORISED_DY: {row['AUTHORISED_DY']}"
                )
            return None

        return "/".join(
            [
                row["AUTHORISED_YR"],
                row["AUTHORISED_MN"],
                row["AUTHORISED_DY"],
            ]
        )

    def map_cross_reference_type_enum(self, val):
        if val == "FOR":
            return "forma"
        return self.map_enum_base(val)
