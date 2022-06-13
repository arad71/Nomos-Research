import csv
import datetime
import os

from loguru import logger

from app.db.dataimport import DataImportBase, DataImportError
from app.db.kingdom.model import Kingdom
from app.db.publication.model import Publication
from app.db.taxon_name.model import TaxonName as TaxonNameModel


class ImportTaxonName(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = TaxonNameModel
        self.upsert_constraint = f"uc_{TaxonNameModel.__tablename__}_legacy_id"
        self.update_cols = (
            "kingdom_id",
            "uninomial",
            "subgenus",
            "specific_epithet",
            "infraspecific_epithet",
            "publication_id",
            "volume_information",
            "is_current",
            "origin",
            "publication_status",
            "form_desc_yr",
            "form_desc_mn",
            "form_desc_dy",
            "comments",
            "contributed_by",
            "contributed_on",
            "validated",
            "source",
            "external_id",
            "family_code",
            "vernacular",
            "editor",
            "naturalised_status",
            "naturalised_certainty",
            "is_eradicated",
            "naturalised_comments",
            "linear_sequence",
            "all_vernaculars",
            "notes",
            "reference",
            "authorised_by",
            "authorised_on",
            "legacy_id",
            "created_by",
            "updated_by",
            "updated_on",
        )

    def row_mapping(self, row):
        return {
            "kingdom_id": self.map_row_by_unique_key(
                Kingdom, "legacy_id", row["KINGDOM_ID"], "kingdom_id"
            ),
            "rank_id": self.map_taxon_rank_by_legacy_id(
                row["RANK_ID"],
                row["KINGDOM_ID"],
            ),
            "uninomial": row["NAME1"] or None,
            "specific_epithet": row["NAME2"] or None,
            "infraspecific_epithet": row["NAME3"] or None,
            "canonical_name": row["NAME"] or None,
            "scientific_name": row["NAME"] or None,
            "publication_id": self.map_row_by_unique_key(
                Publication, "legacy_id", row["PUB_ID"], "publication_id"
            ),
            "volume_information": row["VOL_INFO"] or None,
            "is_current": self.map_y_n_to_bool(row["IS_CURRENT"]),
            "origin": row["ORIGIN"] or None,
            "publication_status": self.map_publication_status(row["INFORMAL"]),
            "form_desc_yr": row["PUB_YEAR"] or row["FORM_DESC_YR"] or None,
            "form_desc_mn": row["FORM_DESC_MN"] or None,
            "form_desc_dy": row["FORM_DESC_DY"] or None,
            "comments": row["COMMENTS"] or None,
            "contributed_by": row["CONTRIBUTED_BY"] or None,
            "contributed_on": self.get_datetime(
                row["CONTRIBUTED_ON"], "%Y-%m-%dT%H:%M:%S%z"
            ),
            "validated": self.map_y_n_to_bool(row["VALIDATED"]),
            "source": row["SOURCE"] or None,
            "external_id": row["EXTERNAL_ID"] or None,
            "family_code": row["FAMILY_CODE"] or None,
            "vernacular": row["VERNACULAR"] or None,
            "editor": row["EDITOR"] or None,
            "naturalised_status": self.map_enum_base(row["NATURALISED_STATUS"]),
            "naturalised_certainty": self.map_y_n_to_bool(row["NATURALISED_CERTAINTY"]),
            "is_eradicated": row["IS_ERADICATED"] or None,
            "naturalised_comments": row["NATURALISED_COMMENTS"] or None,
            "linear_sequence": row["LINEAR_SEQUENCE"] or None,
            "all_vernaculars": row["ALL_VERNACULARS"] or None,
            "notes": row["NOTES"] or None,
            "reference": row["REFERENCE"] or None,
            "authorised_by": row["AUTHORISED_BY"] or None,
            "authorised_on": self.get_datetime(
                row["AUTHORISED_ON"], "%Y-%m-%dT%H:%M:%S%z"
            ),
            "legacy_id": self.legacy_id_prefix + row["NAME_ID"],
            "created_by": self.current_user,
            "updated_by": self.map_user_or_default(row["UPDATED_BY"]),
            "updated_on": row["UPDATED_ON"] or datetime.datetime.now(),
            "created_on": row["UPDATED_ON"] or datetime.datetime.now(),
        }

    def import_row(self, row):
        self.values.append(self.row_mapping(row))

    @classmethod
    def map_publication_status(cls, val):
        if not val:
            return "published"

        if val == "MS":
            return "manuscript_name"

        if val == "PN":
            return "phrase_name"

        raise DataImportError(f'Unable to map publication status: "{val}"')


class ImportTaxonNameFamilyNid(ImportTaxonName):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.update_cols = (*self.update_cols, "family_nid")

    def import_row(self, row):
        item = self.row_mapping(row)
        item["family_nid"] = self.map_row_by_unique_key(
            TaxonNameModel,
            "legacy_id",
            self.legacy_id_prefix + row["FAMILY_NID"] if row["FAMILY_NID"] else None,
            "taxon_name_id",
        )
        self.values.append(item)


class ImportTaxonNameUpload(ImportTaxonName):
    def __init__(self, db, current_user, csvfile):
        super().__init__(db, current_user)
        self.csvfile = csvfile
        self.legacy_id_prefix = os.path.split(self.csvfile)[1].split(".")[0] + ":"
        self.total_rows = 0

    def row_mapping(self, row):
        kingdom_id = self.map_row_by_unique_key(
            Kingdom, "kingdom_name", row["kingdom"], "kingdom_id"
        )
        rank_id = self.map_taxon_rank_by_name(kingdom_id, row["taxonRank"])
        return {
            "kingdom_id": kingdom_id,
            "rank_id": rank_id,
            "uninomial": row["uninomial"] or None,
            "specific_epithet": row["specificEpithet"] or None,
            "infraspecific_epithet": row["infraspecificEpithet"] or None,
            "legacy_id": self.legacy_id_prefix + row["id"],
            "is_current": True,
            "validated": False,
            "admin_comment": (
                f"Created by import script {__name__}"
                f" from source csv {self.legacy_id_prefix}"
                f" on {datetime.date.today()}"
            ),
            "created_by": self.current_user,
            "updated_by": self.current_user,
        }

    def check_canonical_name_without_rank_exists(self, item):
        canonical_name_without_rank = " ".join(
            [item["uninomial"], item["specific_epithet"], item["infraspecific_epithet"]]
        )
        result = (
            self.db.query(TaxonNameModel)
            .filter("kingdom_id" == item["kingdom_id"])
            .filter("rank_id" == item["rank_id"])
            .filter("canonical_name_without_rank" == canonical_name_without_rank)
            .one_or_none()
        )
        if result:
            message = (
                "Unable to map row with canonical_name_without_rank: '"
                + canonical_name_without_rank
                + "'"
            )
            logger.info(message)
            raise DataImportError(message)

    def import_row(self, row):
        item = self.row_mapping(row)
        self.check_canonical_name_without_rank_exists(item)
        self.values.append(item)

    def ingest(self):
        with open(self.csvfile) as csv_file:
            csv_reader = csv.DictReader(csv_file)
            data = list(csv_reader)
            self.total_rows = len(data)
            self._process_rows(data)
            if self.values:
                self.bulk_insert()
            logger.info(
                f"Completed {self.import_name}:"
                f" {self.success_count}/{self.line_count}/{self.total_rows}."
            )
        return True
