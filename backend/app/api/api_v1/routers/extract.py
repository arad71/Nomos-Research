from fastapi import APIRouter, Depends, Response
from fastapi.responses import FileResponse
from fastapi_key_auth import AuthorizerDependency
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.tools.extract_sample_data import SAMPLE_DATA_XLSX, extract_sample_data_file

extract_router = r = APIRouter(prefix="/extract")
authorizer = AuthorizerDependency(key_pattern="IMPORT_API_KEY_")


@r.get(
    "",
    response_class=FileResponse,
    dependencies=[
        Depends(authorizer),
    ],
    description="Fetch previously generated sample data file.",
)
def get_sample_data(response: Response):
    return download_file(response)


def download_file(response):
    response.headers[
        "content-disposition"
    ] = 'attachment; filename="nomos_sample_data.xlsx"'
    return SAMPLE_DATA_XLSX


@r.post(
    "",
    response_class=FileResponse,
    dependencies=[
        Depends(authorizer),
    ],
    description=(
        "Generates sample data file and then downloads it. If delete "
        "parameter is passed then a proportion of the sample data is deleted "
        "in the database. Use this function with caution."
    ),
)
def extract_sample_data(
    response: Response, db: Session = Depends(get_db), delete: bool = False
):
    extract_sample_data_file(db, delete)
    return download_file(response)
