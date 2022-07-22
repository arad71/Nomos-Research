import csv
import datetime
import functools
import os
import traceback

from dateutil.relativedelta import relativedelta
from loguru import logger
from pydantic import ValidationError
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.config import settings
from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User as UserModel

LEGACY_DATA_DIRECTORY = "/legacy_data"


class DataImportBase:
    skip_count: int = 0
    validation_count: int = 0
    success_count: int = 0
    line_count: int = 0
    error_count: int = 0
    total_rows: int = 0

    def __init__(self, db, current_user):
        self.db = db
        self.current_user = current_user
        self.data_model = None
        self.values = []
        self.upsert_constraint = None
        self.update_cols = []

        self.legacy_id_prefix = "WACENSUS:"
        self.import_name = type(self).__name__
        logger.info(f"----- Processing {self.import_name} -----")

    def _process_rows(self, data):
        for row in data:
            if self.line_count == 0:
                pass
            try:
                self.import_row(row)
            except ValidationError as e:
                logger.error("Validation Error: {}", str(e))
                logger.error(row)
                self.validation_count += 1
            except DataSkipError as e:
                logger.debug("Skipping row: {}", str(e))
                logger.debug(row)
                self.skip_count += 1
            except DataImportError as e:
                logger.error("Data Import Error: {}", str(e))
                logger.error(row)
                self.error_count += 1
            except Exception as e:
                logger.critical("Exception: {}", str(e))
                logger.error(row)
                traceback.print_exc()
                break
            else:
                self.success_count += 1
            self.line_count += 1
            if self.line_count % 1000 == 0:
                logger.debug(
                    f"{self.import_name}: "
                    f"{self.success_count}/{self.line_count}/{self.total_rows}. ("
                    f"{self.skip_count} skipped)"
                )

    def ingest(self, import_file: str):
        if settings.WACENSUS_SUFFIX:
            import_file = import_file + settings.WACENSUS_SUFFIX
        path = os.path.join(LEGACY_DATA_DIRECTORY, import_file)
        with open(path, mode="r", encoding=settings.WACENSUS_ENCODING) as csv_file:
            csv_reader = csv.DictReader(csv_file)
            data = list(csv_reader)
            self.total_rows = len(data)
            self._process_rows(data)
            if self.values:
                self.bulk_insert()
            self.report_complete()
        return True

    def report_complete(self):
        logger.info(
            {
                "Completed": self.import_name,
                "rows": self.total_rows,
                "success": self.success_count,
                "validation": self.validation_count,
                "errors": self.error_count,
                "skipped": self.skip_count,
            }
        )

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
        error: bool = True,
    ):
        if not unique_key:
            return None

        result = (
            self.db.query(model)
            .filter(getattr(model, unique_key_field) == unique_key)
            .one_or_none()
        )
        if not result:
            if error:
                raise DataImportError(
                    f"Unable to map {model} row with {unique_key_field}: {unique_key}"
                )
            else:
                return None

        return getattr(result, return_key_field)

    @staticmethod
    def get_datetime(value: str, current_format: str):
        if not value:
            return datetime.datetime.now()

        return datetime.datetime.strptime(value, current_format)

    @staticmethod
    def normalise_datetime(value: datetime):
        if not value:
            return None
        earliest_date = datetime.datetime(2000, 1, 1)
        delta = relativedelta(years=2000)
        if datetime.datetime(value.year, value.month, value.day) < earliest_date:
            value = value + delta
        return value

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

    def map_taxon_rank_by_name(self, kingdom_id, rank_name):
        result = (
            self.db.query(TaxonRank)
            .filter(getattr(TaxonRank, "rank_name") == rank_name)
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

    def map_y_n_to_bool(self, val):
        if not val:
            return None

        if val.lower() == "y":
            return True

        if val.lower() == "n":
            return False

        raise DataImportError("Unable to Map val to bool")


class DataImportError(Exception):
    pass


class DataSkipError(DataImportError):
    pass
