import os.path
import zipfile
from pathlib import Path
from shutil import rmtree

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import FileResponse
from fastapi_key_auth import AuthorizerDependency
from starlette.background import BackgroundTasks

from app.dataimport.csv import import_taxon_names
from app.dataimport.wacensus import import_data
from app.db.dataimport import LEGACY_DATA_DIRECTORY
from app.db.taxon_name.enums import MappingType

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
