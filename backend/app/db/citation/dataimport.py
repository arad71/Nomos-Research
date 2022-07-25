import csv
import datetime
import os
from ast import literal_eval

from app.db.author.crud import AuthorCrud
from app.db.author.model import Author
from app.db.author.schema import AuthorCreate
from app.db.citation.enums import AuthorType
from app.db.citation.model import Citation as CitationModel
from app.db.dataimport import DataImportBase, DataSkipError
from app.db.taxon_name.model import TaxonName
from app.db.user.model import User as UserModel


class ImportCitation(DataImportBase):
    def __init__(self, db, current_user):
        super().__init__(db, current_user)
        self.data_model = CitationModel
        self.upsert_constraint = f"uc_{CitationModel.__tablename__}_legacy_id"
        self.update_cols = (
            "taxon_name_id",
            "author_id",
            "author_type",
            "author_order",
            "legacy_id_name",
            "created_by",
            "updated_by",
            "updated_on",
        )

    def import_row(self, row):
        timestamp = (
            self.normalise_datetime(
                self.get_datetime(
                    value=row["UPDATED_ON"], current_format="%Y-%m-%dT%H:%M:%S%z"
                )
            )
            if row["UPDATED_ON"]
            else datetime.datetime.now()
        )
        self.values.append(
            {
                "taxon_name_id": self.map_row_by_unique_key(
                    TaxonName,
                    "legacy_id",
                    self.legacy_id_prefix + row["NAME_ID"] if row["NAME_ID"] else None,
                    "taxon_name_id",
                ),
                "author_id": self.map_row_by_unique_key(
                    Author, "abbreviation", row["AUTHOR"], "author_id"
                ),
                "author_type": self.map_enum_base(row["AUTHOR_TYPE"]),
                "author_order": row["AUTHOR_ORD"],
                "legacy_id_name": row["AUTHOR"],
                "created_by": self.current_user,
                "updated_by": self.map_row_by_unique_key(
                    UserModel, "legacy_id_name", row["UPDATED_BY"], "user_id"
                ),
                "updated_on": timestamp,
                "created_on": timestamp,
            }
        )


class ImportCitationUpload(ImportCitation):
    def __init__(self, db, current_user, csvfile):
        super().__init__(db, current_user)
        self.csvfile = csvfile
        self.legacy_id_prefix = os.path.split(self.csvfile)[1].split(".")[0] + ":"
        self.total_rows = 0

    def import_row(self, row):
        timestamp = datetime.datetime.now()
        if not literal_eval(row["import_to_nomos"]):
            return None
        if not row["canonical_name_without_rank"]:
            return None
        if not row["Kingdom"]:
            return None
        authors = row["author"]
        if authors:
            authors = literal_eval(authors)
            legacy_id = self.legacy_id_prefix + row["NameID"]
            taxon_name_id = self.map_row_by_unique_key(
                TaxonName, "legacy_id", legacy_id, "taxon_name_id", False
            )
            author_type = (
                AuthorType.basionym
                if literal_eval(row["parenthetical"])
                else AuthorType.current
            )
            if not taxon_name_id:
                raise DataSkipError("Missing taxon_name_id")
            else:
                for i, author in enumerate(authors):
                    db_author = AuthorCrud.get_by_property(
                        self.db, "abbreviation", author
                    )
                    if not db_author:
                        db_author = AuthorCrud.create_item(
                            self.db,
                            AuthorCreate(abbreviation=author, surname=author),
                            current_user=self.current_user,
                        )
                    author_id = db_author.author_id

                    self.values.append(
                        {
                            "taxon_name_id": taxon_name_id,
                            "author_id": author_id,
                            "author_type": author_type,
                            "author_order": i + 1,
                            "legacy_id_name": f"{legacy_id}:{author}" or None,
                            "created_by": self.current_user,
                            "updated_by": self.current_user,
                            "updated_on": timestamp,
                            "created_on": timestamp,
                        }
                    )

    def ingest(self):
        with open(self.csvfile) as csv_file:
            csv_reader = csv.DictReader(csv_file)
            data = list(csv_reader)
            self.total_rows = len(data)
            self._process_rows(data)
            if self.values:
                self.bulk_insert()
            self.report_complete()
        return True
