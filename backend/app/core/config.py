import os
from typing import Any, Dict, Optional

from pydantic import BaseSettings, PostgresDsn, validator
from pydantic.tools import lru_cache


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nomos - Taxonomic Names Management Tool"
    ENVIRONMENT: Optional[str]
    DEFAULT_PAGE_SIZE: int = 10

    FIRST_SUPER_ADMIN_EMAIL: str = "admin@taxman.com"
    FIRST_SUPER_ADMIN_PASSWORD: str = "password"
    FIRST_SUPER_ADMIN_FIRST_NAME: str = "Admin"
    FIRST_SUPER_ADMIN_LAST_NAME: str = "User"

    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super_secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DB_HOST: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    DB_PORT: str = "5432"

    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

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
