from functools import lru_cache
from os import getenv
from typing import Any, Dict, Literal, Optional

from pydantic import AnyUrl, BaseSettings, PostgresDsn, validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nomos - Taxonomic Names Management Tool"
    ENVIRONMENT: str
    DEFAULT_PAGE_SIZE: int = 200

    FIRST_SUPER_ADMIN_EMAIL: str = "admin@taxman.com"
    FIRST_SUPER_ADMIN_PASSWORD: str = "password"
    FIRST_SUPER_ADMIN_FIRST_NAME: str = "Admin"
    FIRST_SUPER_ADMIN_LAST_NAME: str = "User"

    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super_secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    DB_HOST: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    DB_PORT: str = "5432"

    WACENSUS_DATA_FILE_URL: Optional[AnyUrl] = None
    WACENSUS_SUFFIX: str = ".csv"
    WACENSUS_ENCODING: str = "utf-8"

    AUTH_PROVIDER: Literal["auth2", "password"]

    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None
    SQLALCHEMY_SESSION_POOL_SIZE: int = getenv("SQLALCHEMY_SESSION_POOL_SIZE", 50)
    SQLALCHEMY_SESSION_MAX_OVERFLOW: int = getenv("SQLALCHEMY_SESSION_MAX_OVERFLOW", 0)
    # Set this to True to enable printing db queries to the log
    ECHO_DB: bool = False

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("DB_USER"),
            password=values.get("DB_PASSWORD"),
            host=values.get("DB_HOST"),
            path=f"/{values.get('DB_NAME') or  ''}",
            port=values.get("DB_PORT"),
        )

    class Config:
        case_sensitive = True
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
