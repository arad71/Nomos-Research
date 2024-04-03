import os
import time

import pandas as pd
import psycopg2
from fastapi import Depends
from loguru import logger
from openpyxl import load_workbook
from sqlalchemy import create_engine

from app.api.dependencies.range_query import RangeQueryParameter
from app.core.auth import authorize, get_current_active_user
from app.dataimport.wacensus import get_admin_id, trigger_calculated_fields
from app.db.session import SessionLocal
from app.db.taxon_name.enums import MappingType
from app.db.user.schema import User

# def import_cons_code(csvfile, mapping_type, db=SessionLocal()):
#     admin_id = get_admin_id(db)

#     ImportTaxonNameUpload(db, admin_id, csvfile, mapping_type).ingest()
#     if mapping_type == MappingType.curation_data_extract:
#         ImportCitationUpload(db, admin_id, csvfile).ingest()
#     csv_name = os.path.split(csvfile)[1].split(".")[0]
#     trigger_calculated_fields(db, legacy_id_prefix=csv_name)
#     logger.info(f"Imported {csv_name}.")


def import_cons_code(
    db,
    source_file_path: str,
    workbook_index: int,
    taxon_column_index: int,
    conservation_code_column_index: int,
    source: int,
):
    admin_id = get_admin_id(db)

    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=os.environ["DB_HOST"],
            port=os.environ["DB_PORT"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            database=os.environ["DB_NAME"],
        )
    except psycopg2.Error as e:
        print("Error connecting to the database:")
        print(e)
    else:
        print("Connection established successfully")

    # engine = create_engine('postgresql://postgres:password@localhost:5432/taxman')
    # df = pd.read_excel(source_file_path, sheet_name = 'STABS',index_col=0,header=None)
    # .transpose().to_dict('records')
    # df.to_sql('temp_cons1', engine, if_exists='replace',  index=False)

    report_file_name = (
        f'report_update_public_records_{time.strftime("%d%m%Y-%H%M%S")}.csv'
    )

    workbook = load_workbook(source_file_path, True)
    worksheet = workbook.worksheets[workbook_index]

    # print(f'Scientific name\t Existing consv code\t new
    # consv code\t no of records affected in Public db ')
    cnt = 0
    # cur=engine.cursor()
    # cur.execute('select * from  temp_cons')
    # aa=cur.fetchone()
    # print(aa)
    conn.set_session(autocommit=True)
    cur = conn.cursor()
    cur.execute("delete from tmp_cons_code")
    # conn.commit()
    for row in worksheet.iter_rows(1):  # skip header
        cnt = cnt + 1
        row_data = [cell.value for cell in row]

        if row_data[taxon_column_index] is not None:
            sci_name = row_data[taxon_column_index]
            new_cons_code = row_data[conservation_code_column_index]
            # x="insert into temp_cons_1 values(
            # '"+new_cons_code+"','"+str(sci_name).replace("'", '"')+"','"+source+"'
            # )"
            # print(x)
            cur.execute(
                "insert into tmp_cons_code values('"
                + new_cons_code
                + "','"
                + str(sci_name).replace("'", '"')
                + "','"
                + source
                + "')"
            )

            # print(f'{sci_name} \t  {new_cons_code} \t ')

    # conn.commit()
    # current_user=Depends(get_current_active_user)
    user_id = 1
    # : User = Depends(get_current_active_user),
    cur.execute("CALL import_conscode_taxon(%s,%s)", (source, user_id))

    cur.execute("select * from tmp_cons_code")
    cnt = cur.fetchall()
    cur.close()
    conn.close()

    return cnt
