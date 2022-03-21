from app.db.dataimport import DataImportBase
from app.db.kingdom.model import Kingdom
from app.db.publication.model import Publication
from app.db.taxon_name.model import TaxonName as TaxonNameModel
from app.db.user.model import User as UserModel


class ImportTaxonName(DataImportBase):
    def import_row(self, row):

        item = {
            "kingdom_id": self.map_row_by_unique_key(
                Kingdom, "legacy_id", row["KINGDOM_ID"], "kingdom_id"
            ),
            "rank_id": self.map_taxon_rank_by_legacy_id(
                row["RANK_ID"],
                row["KINGDOM_ID"],
            ),
            "rank_name": row["RANK_NAME"],
            "genus": row["NAME1"],
            "subgenus": row["NAME2"],
            "specific_epithet": row["NAME3"],
            "infraspecific_epithet": row["NAME4"],
            "publication_id": self.map_row_by_unique_key(
                Publication, "legacy_id", row["PUB_ID"], "publication_id"
            ),
            "volume_information": row["VOL_INFO"],
            "publication_year": row["PUB_YEAR"] or None,
            "is_current": self.map_enum_base(row["IS_CURRENT"]),
            "origin": row["ORIGIN"],
            "informal": row["INFORMAL"],
            "form_desc_yr": row["FORM_DESC_YR"] or None,
            "form_desc_mn": row["FORM_DESC_MN"] or None,
            "form_desc_dy": row["FORM_DESC_DY"] or None,
            "comments": row["COMMENTS"],
            "contributed_by": row["CONTRIBUTED_BY"],
            "contributed_on": self.get_datetime(row["CONTRIBUTED_ON"], "%d/%b/%y"),
            "validated": self.map_enum_base(row["VALIDATED"]),
            "source": row["SOURCE"],
            "external_id": row["EXTERNAL_ID"],
            "family_code": row["FAMILY_CODE"],
            "author": row["AUTHOR"],
            "vernacular": row["VERNACULAR"],
            "editor": row["EDITOR"],
            "naturalised_status": self.map_enum_base(row["NATURALISED_STATUS"]),
            "naturalised_certainty": self.map_enum_base(row["NATURALISED_CERTAINTY"]),
            "is_eradicated": row["IS_ERADICATED"],
            "naturalised_comments": row["NATURALISED_COMMENTS"],
            "linear_sequence": row["LINEAR_SEQUENCE"] or None,
            # TODO need to handle this relationship.
            #  Collate rows that reference records that do not exist yet and update when we insert them?
            #  second pass at the end?
            # "family_nid": row['FAMILY_NID'],
            "all_vernaculars": row["ALL_VERNACULARS"],
            "notes": row["NOTES"],
            "reference": row["REFERENCE"],
            "authorised_by": row["AUTHORISED_BY"],
            "authorised_on": self.get_datetime(row["AUTHORISED_ON"], "%d/%b/%y"),
            "legacy_id": row["NAME_ID"],
            "created_by": self.current_user,
            "updated_by": self.map_row_by_unique_key(
                UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
            ),
            "updated_on": row["UPDATED_ON"] or None,
        }

        self.insert(
            item, TaxonNameModel, f"uc_{TaxonNameModel.__tablename__}_legacy_id"
        )
