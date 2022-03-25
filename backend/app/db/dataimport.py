import csv
import datetime
import functools
import os
import traceback

from pydantic import ValidationError
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User as UserModel


class DataImportBase:
    def __init__(self, db, current_user):
        self.db = db
        self.current_user = current_user
        self.data_model = None
        self.values = []
        self.upsert_constraint = None
        self.update_cols = []

    def ingest(self, import_file: str):
        path = os.getcwd() + f"/legacy_data/{import_file}"
        with open(path, mode="r", encoding="iso-8859-1") as csv_file:
            csv_reader = csv.DictReader(csv_file)
            line_count = 0
            success_count = 0
            print()
            print(f"----- Processing {type(self).__name__} -----")
            for row in csv_reader:
                if line_count == 0:
                    pass
                try:
                    self.import_row(row)
                except ValidationError as e:
                    print("Validation Error: ", str(e))
                    print(row)
                except DataImportError as e:
                    print("Data Import Error: ", str(e))
                    print(row)
                except Exception as e:
                    print("Exception: ", str(e))
                    print(row)
                    traceback.print_exc()
                    break
                else:
                    success_count += 1
                line_count += 1
                if line_count % 100 == 0:
                    print(".", flush=True, end="")
                    if line_count % 10000 == 0:
                        print("", flush=True)

            if self.values:
                self.bulk_insert()
            print()
            print(f"{success_count}/{line_count}.")
            print()
            print("--------------------------")
        return True

    def import_row(self, row):
        raise Exception(f"function import_data not implemented for {self.__name__}")

    @staticmethod
    def map_enum_base(val):
        if val:
            return val.lower()
        return None

    def bulk_insert(self):
        insert_statement = pg_insert(self.data_model)

        # TODO should we add a variable here to allow update?
        if self.upsert_constraint:
            insert_statement = insert_statement.on_conflict_do_update(
                constraint=self.upsert_constraint,
                set_={
                    k: getattr(insert_statement.excluded, k) for k in self.update_cols
                },
            )

        self.db.execute(insert_statement, self.values)
        self.db.commit()

    def insert(self, data: dict, model: object, upsert_constraint: str = None):
        insert_statement = pg_insert(model).values(data)
        # TODO should we add a variable here to allow update?
        if upsert_constraint:
            insert_statement = insert_statement.on_conflict_do_update(
                constraint=upsert_constraint, set_=data
            )
        self.db.execute(insert_statement)
        self.db.commit()

    @functools.cache
    def map_row_by_unique_key(
        self,
        model: object,
        unique_key_field: str,
        unique_key: [int, str],
        return_key_field: str,
    ):
        if not unique_key:
            return None

        result = (
            self.db.query(model)
            .filter(getattr(model, unique_key_field) == unique_key)
            .one_or_none()
        )
        if not result:
            raise DataImportError(
                "Unable to map row with " + unique_key_field + ": '" + unique_key + "'"
            )

        return getattr(result, return_key_field)

    @staticmethod
    def get_datetime(value: str, current_format: str):
        if not value:
            return None

        return datetime.datetime.strptime(value, current_format)

    def map_taxon_rank_by_legacy_id(self, legacy_id: str, kingdom_id: str):
        if not legacy_id or not kingdom_id:
            return None

        result = (
            self.db.query(TaxonRank)
            .filter(getattr(TaxonRank, "legacy_id") == legacy_id)
            .filter(getattr(TaxonRank, "kingdom_id") == kingdom_id)
            .one_or_none()
        )

        return getattr(result, "taxon_rank_id")

    def map_user_or_default(self, legacy_id):
        if not legacy_id:
            return self.current_user

        return self.map_row_by_unique_key(
            UserModel, "legacy_id_name", legacy_id, "user_id"
        )


class DataImportError(Exception):
    pass
