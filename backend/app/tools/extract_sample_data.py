#!/usr/bin/env python3
# script to extract sample data from the database
import numpy
import pandas as pd
from loguru import logger
from pandas import ExcelWriter
from psycopg2.extensions import register_adapter
from sqlalchemy.orm import Session
from sqlalchemy_utils.types.pg_composite import AsIs

from app.db.author.model import Author
from app.db.citation.model import Citation
from app.db.classification_system.model import ClassificationSystem
from app.db.cross_reference.model import CrossReference
from app.db.hierarchy.model import Hierarchy
from app.db.informal_group.model import InformalGroup
from app.db.kingdom.model import Kingdom
from app.db.publication.model import Publication
from app.db.role.model import Role
from app.db.session import SessionLocal, engine
from app.db.taxon_name.model import TaxonName
from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User
from app.db.user_role.model import UserRole
from app.db.vernacular.model import Vernacular

SAMPLE_DATA_XLSX = "/app/nomos_sample_data.xlsx"


def adapt_numpy_int64(numpy_int64):
    return AsIs(numpy_int64)


def extract_sample_data_file(db: Session = None, delete=False):
    register_adapter(numpy.int64, adapt_numpy_int64)
    if not db:
        db = SessionLocal()
    tables = (
        Author,
        Citation,
        ClassificationSystem,
        CrossReference,
        Hierarchy,
        InformalGroup,
        Kingdom,
        Publication,
        Role,
        TaxonName,
        TaxonRank,
        User,
        UserRole,
        Vernacular,
    )
    # We don't want to delete records from these tables as they are
    keep = (
        ClassificationSystem,
        Kingdom,
        TaxonRank,
        Hierarchy,
        User,
        Role,
        UserRole,
    )

    db.begin()
    limit = 500
    delete_proportion = 0.3
    writer = ExcelWriter(
        SAMPLE_DATA_XLSX, date_format="YYYY-MM-DD", datetime_format="YYYY-MM-DD"
    )
    for table in tables:
        table_name = table.__tablename__
        table_df = pd.read_sql_table(table_name, con=engine)
        table_df.info()
        # Extract limit rows or all rows if there are fewer than limit, unless this is
        # taxon_name table
        table_df.info(verbose=True, show_counts=True)
        n = min(limit, len(table_df.index))
        sample = table_df.sample(n=n, random_state=1)
        date_columns = sample.select_dtypes(include=["datetime64[ns, UTC]"]).columns
        for date_column in date_columns:
            # Date columns with time zones cause some issues when exporting
            # to Excel, so we convert them to datetime without timezone
            sample[date_column] = pd.to_datetime(
                sample[date_column], utc=True, errors="coerce"
            )
            sample[date_column] = sample[date_column].dt.date

        sample.to_excel(writer, sheet_name=table_name)
        if delete and table not in keep:
            logger.debug("Deleting sample records from {}", table_name)
            deletes = sample.sample(int(delete_proportion * n), random_state=1)
            deletes.to_excel(writer, sheet_name=f"{table_name}_deletes")
            primary_key = deletes.columns[0]
            delete_ids = deletes[primary_key].unique()
            query = db.query(table).filter(getattr(table, primary_key).in_(delete_ids))
            for record in query:
                db.delete(record)
    logger.debug("Saving sample data to {}.", SAMPLE_DATA_XLSX)
    writer.save()
    logger.debug("Flushing changes to database")
    db.flush()
    logger.debug("Committing transaction")
    db.commit()


if __name__ == "__main__":
    extract_sample_data_file(None, True)
