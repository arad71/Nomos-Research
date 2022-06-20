from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import FileResponse
from fastapi_key_auth import AuthorizerDependency
from starlette.background import BackgroundTasks

from app.dataimport.csv import import_taxon_names
from app.dataimport.wacensus import import_data
from app.db.dataimport import LEGACY_DATA_DIRECTORY

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
def import_csvupload_data(background_tasks: BackgroundTasks, upload_file: UploadFile):
    contents = upload_file.file.read()
    flie_path = "/legacy_data/" + upload_file.filename
    with open(flie_path, "wb+") as file_path:
        file_path.write(contents)

    background_tasks.add_task(import_taxon_names, flie_path)
    return background_tasks.tasks
