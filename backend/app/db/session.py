from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core import config

engine = create_engine(
    config.settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    echo=config.settings.ECHO_DB,
    pool_size=config.settings.SQLALCHEMY_SESSION_POOL_SIZE,
    max_overflow=config.settings.SQLALCHEMY_SESSION_MAX_OVERFLOW,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
