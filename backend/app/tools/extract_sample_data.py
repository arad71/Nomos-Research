#!/usr/bin/env python3
# script to extract sample data from the database
import io

import pandas as pd
from pandas import ExcelWriter

from app.db.session import engine

tables = (
    "author",
    "citation",
    "classification_system",
    "cross_reference",
    "hierarchy",
    "informal_group",
    "kingdom",
    "publication",
    "role",
    "taxon_name",
    "taxon_rank",
    "user",
    "user_role",
    "vernacular",
)
output_file = "/app/nomos_sample_data.xlsx"
limit = 100
writer = ExcelWriter(
    output_file, date_format="YYYY-MM-DD", datetime_format="YYYY-MM-DD HH:MM:SS"
)
for table_name in tables:
    table_df = pd.read_sql_table(table_name, con=engine)
    table_df.info()
    # Extract limit rows or all rows if there are fewer than limit, unless this is
    # taxon_name table
    table_df.info(verbose=True, show_counts=True)
    n = 500 if table_name is "taxon_name" else limit
    n = min(n, len(table_df.index))
    sample = table_df.sample(n=n, random_state=1)
    sample.to_excel(writer, sheet_name=table_name)
    print(sample)
writer.save()
