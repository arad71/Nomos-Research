import uvicorn
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from sqlalchemy.exc import IntegrityError
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.api.api_v1.routers.auth import auth_router
from app.api.api_v1.routers.authors import authors_router
from app.api.api_v1.routers.checklist import checklist_router
from app.api.api_v1.routers.citations import citations_router
from app.api.api_v1.routers.classification_systems import classification_systems_router
from app.api.api_v1.routers.conscode_taxons import conscode_taxons_router
from app.api.api_v1.routers.conservation_codes import conservation_codes_router
from app.api.api_v1.routers.cross_references import cross_references_router
from app.api.api_v1.routers.dataimport import data_import_router
from app.api.api_v1.routers.extract import extract_router
from app.api.api_v1.routers.hierarchies import hierarchies_router
from app.api.api_v1.routers.informal_groups import informal_groups_router
from app.api.api_v1.routers.kingdoms import kingdoms_router
from app.api.api_v1.routers.publications import publications_router
from app.api.api_v1.routers.roles import roles_router
from app.api.api_v1.routers.taxon_names import taxon_names_router
from app.api.api_v1.routers.taxon_name_parents import taxon_name_parents_router
from app.api.api_v1.routers.taxon_name_parent_reviews import taxon_name_parent_reviews_router
from app.api.api_v1.routers.taxon_ranks import taxon_ranks_router
from app.api.api_v1.routers.user_roles import user_roles_router
from app.api.api_v1.routers.users import users_router
from app.api.api_v1.routers.vernaculars import vernaculars_router
from app.core import config
from app.core.auth import get_current_active_user
from app.db.init_db import init_db
from app.db.session import get_db

API_V1_URL = config.settings.API_V1_STR

app = FastAPI(
    title=config.settings.PROJECT_NAME,
    version=config.settings.PROJECT_VERSION,
    docs_url="/api/docs",
    openapi_url="/api",
)


origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, e: IntegrityError):
    message = f'{e.args[-1].split(":")[1]}'
    logger.error(e)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        headers={"X-Error": repr(e.__repr__())},
        content={"detail": message},
    )


@app.get(API_V1_URL)
async def root():
    return {"message": "Hello World"}


# Routers
app.include_router(
    users_router,
    prefix=API_V1_URL,
    tags=["users"],
    dependencies=[Depends(get_current_active_user)],
)
app.include_router(
    roles_router,
    prefix=API_V1_URL,
    tags=["roles"],
    dependencies=[Depends(get_current_active_user)],
)
app.include_router(
    user_roles_router,
    prefix=API_V1_URL,
    tags=["user_roles"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    authors_router,
    prefix=API_V1_URL,
    tags=["authors"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    classification_systems_router,
    prefix=API_V1_URL,
    tags=["classification_systems"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    citations_router,
    prefix=API_V1_URL,
    tags=["citations"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    conscode_taxons_router,
    prefix=API_V1_URL,
    tags=["conscode_taxons"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    cross_references_router,
    prefix=API_V1_URL,
    tags=["cross_references"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    hierarchies_router,
    prefix=API_V1_URL,
    tags=["hierarchies"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    informal_groups_router,
    prefix=API_V1_URL,
    tags=["informal_groups"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    kingdoms_router,
    prefix=API_V1_URL,
    tags=["kingdoms"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    publications_router,
    prefix=API_V1_URL,
    tags=["publications"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    conservation_codes_router,
    prefix=API_V1_URL,
    tags=["conservation_codes"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    taxon_names_router,
    prefix=API_V1_URL,
    tags=["taxon_names"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    taxon_name_parents_router,
    prefix=API_V1_URL,
    tags=["taxon_name_parents"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    taxon_name_parent_reviews_router,
    prefix=API_V1_URL,
    tags=["taxon_name_parent_reviews"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    taxon_ranks_router,
    prefix=API_V1_URL,
    tags=["taxon_ranks"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    vernaculars_router,
    prefix=API_V1_URL,
    tags=["vernaculars"],
    dependencies=[Depends(get_current_active_user)],
)


app.include_router(
    checklist_router,
    prefix=API_V1_URL,
    tags=["checklist"],
    dependencies=[],
)

app.include_router(
    data_import_router,
    prefix=API_V1_URL,
    tags=["import"],
    dependencies=[],
)
app.include_router(
    extract_router,
    prefix=API_V1_URL,
    tags=["extract"],
    dependencies=[],
)

app.include_router(auth_router, prefix="/api", tags=["auth"])


@app.on_event("startup")
async def initialise_database():
    session = get_db().__next__()
    init_db(session)
    session.close()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        reload=config.settings.UVICORN_RELOAD,
        port=8888,
        workers=config.settings.WEB_CONCURRENCY,
    )
