import io
import os
import warnings
from datetime import date, datetime

import pandas as pd
import psycopg2
from fastapi import FastAPI, Response
from fastapi.responses import FileResponse, StreamingResponse

# from loguru import logger
from openpyxl import load_workbook


def import_cons_code(
    db,
    source_file_path: str,
    workbook_index: int,
    taxon_column_index: int,
    conservation_code_column_index: int,
    effective_date_column_index: date,
    source: int,
):
    #   admin_id = get_admin_id(db)
    date_format = "%Y-%m-%d"
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

    workbook = load_workbook(source_file_path, True)
    worksheet = workbook.worksheets[workbook_index]

    conn.set_session(autocommit=True)
    cur = conn.cursor()
    cur.execute("delete from tmp_cons_code")
    # conn.commit()
    cnt = 0
    for row in worksheet.iter_rows(1):  # skip header
        cnt = cnt + 1
        row_data = [cell.value for cell in row]

        if (
            row_data[taxon_column_index] is not None
            and row_data[conservation_code_column_index] is not None
        ):
            sci_name = row_data[taxon_column_index]
            new_cons_code = row_data[conservation_code_column_index]
            effective_from = row_data[effective_date_column_index]
            # print('aa'+effective_from)
            if effective_from is not None:
                e = effective_from
                # print('aa'+str(e))
                # ef=datetime.strptime(effective_from,"%Y-%m-%d %H:%M:%S")
                # print(ef)

                cur.execute(
                    "insert into tmp_cons_code (conservation_code, scientific_name,"
                    + " source, effective_from) values('"
                    + new_cons_code
                    + "','"
                    + str(sci_name).replace("'", '^')
                    + "','"
                    + source
                    + "','"
                    + str(e)
                    + "')"
                )
            else:
                cur.execute(
                    "insert into tmp_cons_code (conservation_code, scientific_name,"
                    + " source) values('"
                    + new_cons_code
                    + "','"
                    + str(sci_name).replace("'", '^')
                    + "','"
                    + source
                    + "')"
                )

    user_id = 1
    # : User = Depends(get_current_active_user),
    cur.execute("CALL import_conscode_taxon(%s,%s)", (source, user_id))


    warnings.filterwarnings("ignore")
    df = pd.read_sql("select * from tmp_cons_code", con=conn)
    response = StreamingResponse(
        io.StringIO(df.to_csv(index=False)), media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=export.csv"

    cur.close()
    conn.close()
    return response
