import uvicorn
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request

from app.api.api_v1.routers.auth import auth_router
from app.api.api_v1.routers.author import authors_router
from app.api.api_v1.routers.classification_system import classification_systems_router
from app.api.api_v1.routers.cross_reference import cross_references_router
from app.api.api_v1.routers.hierarchy import hierarchies_router
from app.api.api_v1.routers.kingdoms import kingdoms_router
from app.api.api_v1.routers.publication import publications_router
from app.api.api_v1.routers.taxon_name import taxon_names_router
from app.api.api_v1.routers.taxon_rank import taxon_ranks_router
from app.api.api_v1.routers.users import users_router
from app.api.api_v1.routers.vernacular import vernaculars_router
from app.core import config
from app.core.auth import get_current_active_user
from app.core.celery_app import celery_app
from app.db.session import SessionLocal

app = FastAPI(title=config.PROJECT_NAME, docs_url="/api/docs", openapi_url="/api")

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


@app.get("/api/v1")
async def root():
    return {"message": "Hello World"}


@app.get("/api/v1/task")
async def example_task():
    celery_app.send_task("app.tasks.example_task", args=["Hello World"])

    return {"message": "success"}


# Routers
app.include_router(
    users_router,
    prefix="/api/v1",
    tags=["users"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    kingdoms_router,
    prefix="/api/v1",
    tags=["kingdoms"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    authors_router,
    prefix="/api/v1",
    tags=["author"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    classification_systems_router,
    prefix="/api/v1",
    tags=["classification_system"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    cross_references_router,
    prefix="/api/v1",
    tags=["cross_reference"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    hierarchies_router,
    prefix="/api/v1",
    tags=["hierachy"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    kingdoms_router,
    prefix="/api/v1",
    tags=["kingdoms"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    publications_router,
    prefix="/api/v1",
    tags=["publication"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    taxon_names_router,
    prefix="/api/v1",
    tags=["taxon_name"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    taxon_ranks_router,
    prefix="/api/v1",
    tags=["taxon_rank"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(
    vernaculars_router,
    prefix="/api/v1",
    tags=["vernacular"],
    dependencies=[Depends(get_current_active_user)],
)

app.include_router(auth_router, prefix="/api", tags=["auth"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", reload=True, port=8888)
