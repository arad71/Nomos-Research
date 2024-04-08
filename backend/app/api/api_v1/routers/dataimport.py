import os.path
import zipfile
from pathlib import Path
from shutil import rmtree

# import pandas as pd
from fastapi import APIRouter, BackgroundTasks, Depends, Response, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from fastapi_key_auth import AuthorizerDependency
import io

from app.dataimport.conservationcodeimport import import_cons_code
from app.dataimport.csv import import_taxon_names
from app.dataimport.wacensus import (  # get_admin_id, trigger_calculated_fields
    import_data,
)
from app.db.dataimport import LEGACY_DATA_DIRECTORY
from app.db.session import SessionLocal
from app.db.taxon_name.enums import ConsCodeSource, MappingType

# from openpyxl import load_workbook


data_import_router = r = APIRouter(prefix="/dataimport")
authorizer = AuthorizerDependency(key_pattern="IMPORT_API_KEY_")


@r.get(
    "",
    dependencies=[
        Depends(authorizer),
    ],
)
def get_import_log():
    return FileResponse(f"{LEGACY_DATA_DIRECTORY}/import.log")


@r.post(
    "/wacensus",
    status_code=201,
    dependencies=[
        Depends(authorizer),
    ],
)
def import_wacensus_data(background_tasks: BackgroundTasks):
    background_tasks.add_task(import_data)
    return background_tasks.tasks


@r.post(
    "/csvupload",
    status_code=201,
    dependencies=[
        Depends(authorizer),
    ],
)
def import_csvupload_data(
    background_tasks: BackgroundTasks,
    upload_file: UploadFile,
    mapping_type: MappingType,
):
    contents = upload_file.file.read()
    file_path = "/legacy_data/" + upload_file.filename
    if os.path.exists(file_path):
        os.remove(file_path)
    with open(file_path, "wb+") as uploaded_file:
        uploaded_file.write(contents)
    if file_path.endswith(".zip"):
        extracted_folder = file_path + "_extracted/"
        if os.path.exists(extracted_folder):
            rmtree(extracted_folder)
        Path(extracted_folder).mkdir(parents=True)
        with zipfile.ZipFile(file_path, "r") as uploaded_file:
            uploaded_file.extractall(extracted_folder)
            files = Path(extracted_folder).glob("*")
            for file in files:
                background_tasks.add_task(import_taxon_names, file, mapping_type)
    else:
        background_tasks.add_task(import_taxon_names, file_path, mapping_type)
    return background_tasks.tasks


@r.post(
    "/conservationcodeimport",
    status_code=201,
    dependencies=[
        Depends(authorizer),
    ],
)
def import_conservation_code(
    background_tasks: BackgroundTasks,
    upload_file: UploadFile,
    authority: ConsCodeSource,
    worksheet: int,
    taxon_column_index: int,
    conservation_code_column_index: int,
):
    contents = upload_file.file.read()
    file_path = "/legacy_data/" + upload_file.filename
    if os.path.exists(file_path):
        os.remove(file_path)
    with open(file_path, "wb+") as uploaded_file:
        uploaded_file.write(contents)
    if file_path.endswith(".zip"):
        extracted_folder = file_path + "_extracted/"
        if os.path.exists(extracted_folder):
            rmtree(extracted_folder)
        Path(extracted_folder).mkdir(parents=True)
        with zipfile.ZipFile(file_path, "r") as uploaded_file:
            uploaded_file.extractall(extracted_folder)
            files = Path(extracted_folder).glob("*")
            for file in files:
                background_tasks.add_task(import_cons_code, file, ConsCodeSource)
    else:
        print(authority.name)
        no_of_row = import_cons_code(
            db=SessionLocal(),
            source_file_path=file_path,
            workbook_index=worksheet,
            taxon_column_index=taxon_column_index,
            conservation_code_column_index=conservation_code_column_index,
            source=authority.value,
        )


    return no_of_row
