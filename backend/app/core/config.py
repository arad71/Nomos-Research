from functools import lru_cache
from importlib import metadata
from os import getenv
from typing import Any, Dict, Literal, Optional

from pydantic import AnyUrl, BaseSettings, Field, PostgresDsn, validator


class Settings(BaseSettings):
    """
    A class for the settings for the application.

    This class uses environment variables to override the default settings.
    """

    PROJECT_NAME: str = Field(
        metadata.metadata("Nomos")["summary"],
        description="The name of the project, fetched from `pyproject.toml`.",
    )
    PROJECT_VERSION: str = Field(
        f'v{metadata.version("Nomos")}',
        description="The version of the project, fetched from `pyproject.toml`.",
    )

    ENVIRONMENT: str = Field(
        ..., description="The environment the application is running in."
    )
    DEFAULT_PAGE_SIZE: int = Field(
        200, description="The default page size for pagination."
    )

    FIRST_SUPER_ADMIN_EMAIL: str = Field(
        "admin@taxman.com",
        description="The email address of the first super admin user.",
    )
    FIRST_SUPER_ADMIN_PASSWORD: str = Field(
        "password", description="The password for the first super admin user."
    )
    FIRST_SUPER_ADMIN_FIRST_NAME: str = Field(
        "Admin", description="The first name of the first super admin user."
    )
    FIRST_SUPER_ADMIN_LAST_NAME: str = Field(
        "User", description="The last name of the first super admin user."
    )
    FIRST_SUPER_ADMIN_STARTUP_OVERRIDE: bool = Field(
        False,
        description=(
            "Flag to determine if the startup override is enabled for the first super"
            " admin."
        ),
    )
    FIRST_SUPER_ADMIN_USER_ID: int = Field(
        1, description="The user ID of the first super admin."
    )

    CREATE_DEMO_USERS: bool = Field(
        False, description="Flag to determine if demo users should be created."
    )

    API_V1_STR: str = Field("/api/v1", description="The base path for API version 1.")
    SECRET_KEY: str = Field(
        "super_secret", description="The secret key used for signing tokens."
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        60 * 24, description="The expiration time for access tokens in minutes."
    )

    DB_HOST: str = Field(..., description="The database host.")
    DB_USER: str = Field(..., description="The database user.")
    DB_PASSWORD: str = Field(..., description="The database password.")
    DB_NAME: str = Field(..., description="The database name.")
    DB_PORT: str = Field("5432", description="The database port, default is '5432'.")

    WACENSUS_DATA_FILE_URL: Optional[AnyUrl] = Field(
        None, description="The URL for the WACensus data file."
    )
    WACENSUS_SUFFIX: str = Field(
        ".csv", description="The suffix for WACensus files, default is '.csv'."
    )
    WACENSUS_ENCODING: str = Field(
        "utf-8", description="The encoding for WACensus files, default is 'utf-8'."
    )

    AUTH_PROVIDER: Literal["auth2", "password"] = Field(
        ..., description="The authentication provider to use."
    )

    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = Field(
        None, description="The SQLAlchemy database URI."
    )
    SQLALCHEMY_SESSION_POOL_SIZE: int = Field(
        getenv("SQLALCHEMY_SESSION_POOL_SIZE", 50),
        description="The size of the SQLAlchemy session pool.",
    )
    SQLALCHEMY_SESSION_MAX_OVERFLOW: int = Field(
        getenv("SQLALCHEMY_SESSION_MAX_OVERFLOW", 0),
        description="The maximum overflow size for the SQLAlchemy session pool.",
    )
    UVICORN_RELOAD: bool = Field(
        bool(getenv("UVICORN_RELOAD", False)),
        description="Flag to determine if Uvicorn should reload on code changes.",
    )
    WEB_CONCURRENCY: int = Field(
        int(getenv("WEB_CONCURRENCY", 1)),
        description="The number of web server workers.",
    )

    ECHO_DB: bool = Field(
        False,
        description="Flag to enable or disable echoing of database queries to the log.",
    )

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        """
        Assembles the database connection string from individual settings.

        Parameters
        ----------
        v : Optional[str]
            The database URI string.
        values : Dict[str, Any]
            The dictionary containing individual database settings.

        Returns
        -------
        Any
            The assembled database URI.
        """
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("DB_USER"),
            password=values.get("DB_PASSWORD"),
            host=values.get("DB_HOST"),
            path=f"/{values.get('DB_NAME') or ''}",
            port=values.get("DB_PORT"),
        )

    class Config:
        """
        Configuration class for Settings.

        Attributes
        ----------
        case_sensitive : bool
            Flag to enable case sensitivity for environment variables.
        env_file : str
            The path to the environment file.
        """

        case_sensitive = True
        env_file = ".env"


@lru_cache()
def get_settings():
    """
    Returns the settings instance.

    Uses lru_cache to cache the settings instance for improved performance.

    Returns
    -------
    Settings
        The settings instance.
    """
    return Settings()


settings = get_settings()
