import uvicorn
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request

from app.api.api_v1.routers.auth import auth_router
from app.api.api_v1.routers.authors import authors_router
from app.api.api_v1.routers.checklist import checklist_router
from app.api.api_v1.routers.citations import citations_router
from app.api.api_v1.routers.classification_systems import classification_systems_router
from app.api.api_v1.routers.cross_references import cross_references_router
from app.api.api_v1.routers.hierarchies import hierarchies_router
from app.api.api_v1.routers.informal_groups import informal_groups_router
from app.api.api_v1.routers.kingdoms import kingdoms_router
from app.api.api_v1.routers.publications import publications_router
from app.api.api_v1.routers.roles import roles_router
from app.api.api_v1.routers.taxon_names import taxon_names_router
from app.api.api_v1.routers.taxon_ranks import taxon_ranks_router
from app.api.api_v1.routers.user_roles import user_roles_router
from app.api.api_v1.routers.users import users_router
from app.api.api_v1.routers.vernaculars import vernaculars_router
from app.core import config
from app.core.auth import get_current_active_user
from app.db.session import SessionLocal

API_V1_URL = config.settings.API_V1_STR

app = FastAPI(
    title=config.settings.PROJECT_NAME, docs_url="/api/docs", openapi_url="/api"
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


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    request.state.db = SessionLocal()
    response = await call_next(request)
    request.state.db.close()
    return response


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
    tags=["user-roles"],
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
    taxon_names_router,
    prefix=API_V1_URL,
    tags=["taxon_names"],
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

app.include_router(auth_router, prefix="/api", tags=["auth"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", reload=True, port=8888)
