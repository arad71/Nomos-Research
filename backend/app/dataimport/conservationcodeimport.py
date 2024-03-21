import os

from loguru import logger
from sqlalchemy import create_engine
import psycopg2
from openpyxl import load_workbook
import pandas as pd

from app.dataimport.wacensus import get_admin_id, trigger_calculated_fields
from app.db.session import SessionLocal
from app.db.taxon_name.enums import MappingType


# def import_cons_code(csvfile, mapping_type, db=SessionLocal()):
#     admin_id = get_admin_id(db)
    
#     ImportTaxonNameUpload(db, admin_id, csvfile, mapping_type).ingest()
#     if mapping_type == MappingType.curation_data_extract:
#         ImportCitationUpload(db, admin_id, csvfile).ingest()
#     csv_name = os.path.split(csvfile)[1].split(".")[0]
#     trigger_calculated_fields(db, legacy_id_prefix=csv_name)
#     logger.info(f"Imported {csv_name}.")


def import_cons_code(db, source_file_path: str, workbook_index: int, taxon_column_index: int,
                              conservation_code_column_index: int, source:int):
    
    admin_id = get_admin_id(db)
    
    
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=os.environ['DB_HOST'],
            port=os.environ['DB_PORT'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            database=os.environ['DB_NAME']
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

    workbook = load_workbook(source_file_path, True)
    worksheet = workbook.worksheets[workbook_index]
    
    # print(f'Scientific name\t Existing consv code\t new consv code\t no of records affected in Public db ') 
    cnt=0
    # cur=engine.cursor()
    # cur.execute('select * from  temp_cons')
    # aa=cur.fetchone()
    # print(aa)
    conn.set_session(autocommit=True)
    cur = conn.cursor()
    cur.execute("delete from temp_cons_1")
    # conn.commit()
    for row in worksheet.iter_rows(1):  # skip header
            
        cnt=cnt+1
        row_data = [cell.value for cell in row]
        
        if row_data[taxon_column_index] is not None:
                sci_name=row_data[taxon_column_index]
                new_cons_code = row_data[conservation_code_column_index]
                # x="insert into temp_cons_1 values('"+new_cons_code+"','"+str(sci_name).replace("'", '"')+"','"+source+"')"
                # print(x)
                cur.execute("insert into temp_cons_1 values('"+new_cons_code+"','"+str(sci_name).replace("'", '"')+"','"+source+"')")
                
                # print(f'{sci_name} \t  {new_cons_code} \t ') 
   
    # conn.commit()
    
    cur.execute("CALL import_cons_code(%s, %s);", (source, source_file_path))
    cur.close()
    conn.close()
    

    return cnt