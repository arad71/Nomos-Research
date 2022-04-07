from typing import Any, Callable, Optional, Sequence

import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import SecurityScopes
from jwt import PyJWTError
from loguru import logger
from pydantic import ValidationError

import app.db.user.model as model
import app.db.user.schema as schema
from app.core import security
from app.db import session
from app.db.role.constants import Role
from app.db.user.crud import UserCrud


async def get_current_user(
    security_scopes: SecurityScopes,
    db=Depends(session.get_db),
    token: str = Depends(security.oauth2_scheme),
) -> model.User:
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )

    try:
        payload = jwt.decode(
            token, security.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = schema.TokenData(email=email, scopes=token_scopes)
    except (PyJWTError, ValidationError):
        logger.error("Error Decoding Token", exc_info=True)
        raise credentials_exception

    user = UserCrud.get_user_by_email(db, email)
    if user is None:
        raise credentials_exception

    if security_scopes.scopes:
        # Find which roles from the required scopes are included in the user's scopes
        permission_intersection = set(security_scopes.scopes).intersection(
            set(token_data.scopes)
        )
        if not permission_intersection:
            logger.debug("Scope not granted", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )
    return user


async def get_current_active_user(
    current_user=Security(get_current_user, scopes=[], use_cache=False),
) -> model.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def authorize(
    scopes: Sequence[str] = None,
    dependency: Optional[Callable[..., Any]] = get_current_active_user,
) -> model.User:
    """
    Check the user is active and has required permissions (scopes) to accessible

    Wrapper for FastAPI Security. If Security is used as a dependency directly it seems to fail due to cache. Wrapping it avoids this problem.
    :param scopes: Security roles / scopes that the user needs
    :param dependency: Dependency to check. Defaults to get_current_active_user

    :return: User
    """
    return Security(dependency=dependency, scopes=scopes)


async def get_current_active_superuser(
    current_user: model.User = authorize(scopes=[Role.SUPER_ADMIN["name"]]),
) -> model.User:
    return current_user


def authenticate_user(db, email: str, password: str) -> model.User | False:
    user = UserCrud.get_user_by_email(db, email)
    if not user:
        return False
    if not security.verify_password(password, user.hashed_password):
        return False
    return user


def sign_up_new_user(db, email: str, password: str):
    user = UserCrud.get_user_by_email(db, email)
    if user:
        return False  # User already exists
    new_user = UserCrud.create_item(
        db,
        schema.UserCreate(
            email=email,
            password=password,
            is_active=True,
        ),
    )
    return new_user
