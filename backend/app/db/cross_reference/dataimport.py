import datetime

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
            "authorised_yr",
            "authorised_mn",
            "authorised_dy",
            "authorised_by",
            "reference_comments",
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
                    TaxonName,
                    "legacy_id",
                    self.legacy_id_prefix + row["OLD_NAME_ID"]
                    if row["OLD_NAME_ID"]
                    else None,
                    "taxon_name_id",
                ),
                "new_name_id": self.map_row_by_unique_key(
                    TaxonName,
                    "legacy_id",
                    self.legacy_id_prefix + row["NEW_NAME_ID"]
                    if row["NEW_NAME_ID"]
                    else None,
                    "taxon_name_id",
                ),
                "cross_reference_type": self.map_cross_reference_type_enum(
                    row["XREF_TYPE"]
                ),
                "active": self.map_y_n_to_bool(row["ACTIVE"]),
                "authorised_yr": row["AUTHORISED_YR"] or None,
                "authorised_mn": row["AUTHORISED_MN"] or None,
                "authorised_dy": row["AUTHORISED_DY"] or None,
                "authorised_by": row["AUTHORISED_BY"],
                "reference_comments": row["COMMENTS"],
                "notes": row["NOTES"],
                "legacy_id": row["XREF_ID"],
                "created_by": self.map_user_or_default(row["ADDED_BY"]),
                "created_on": row["ADDED_ON"]
                or row["UPDATED_ON"]
                or datetime.datetime.now(),
                "updated_by": self.map_user_or_default(row["UPDATED_BY"]),
                "updated_on": row["UPDATED_ON"] or datetime.datetime.now(),
            }
        )

    def map_cross_reference_type_enum(self, val):
        if val == "OGV":
            return "orthographic_variant"

        if val == "EXC":
            return "excluded_name"

        if val == "MIS":
            return "misapplied_name"

        if val == "TSY":
            return "subjective_synonym"

        if val == "NSY":
            return "objective_synonym"

        if val == "CON":
            return "concept_change"

        if val == "FOR":
            return "formal_description"

        if val == "ERR":
            return "name_entered_in_error"

        if val == "ISY":
            return "isonym"

        return self.map_enum_base(val)
