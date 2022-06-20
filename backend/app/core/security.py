from datetime import datetime, timedelta

import jwt
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

from app.core.config import settings
from app.db.role.constants import Role


def get_scopes() -> dict:
    scopes = {}
    for role_name, role_value in Role.__dict__.items():
        # skip private methods and properties that have been defined by being a dict
        if role_name[:2] != "__":
            scopes.update({role_value["name"]: role_value["description"]})
    return scopes


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth2token" if settings.AUTH_PROVIDER == "auth2" else "/api/token",
    scopes=get_scopes(),
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
