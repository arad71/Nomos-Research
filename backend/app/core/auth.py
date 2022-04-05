import inspect
from pprint import pprint

import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import SecurityScopes
from jwt import PyJWTError
from loguru import logger

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
):
    print(inspect.currentframe())
    print(locals())
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    pprint(authenticate_value)

    try:
        payload = jwt.decode(
            token, security.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schema.TokenData(**payload)
    except PyJWTError:
        logger.error("Error Decoding Token", exc_info=True)
        raise credentials_exception

    user = UserCrud.get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    if security_scopes.scopes and not token_data.scopes:
        pprint("bar")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not enough permissions",
            headers={"WWW-Authenticate": authenticate_value},
        )
    if security_scopes.scopes and token_data.scopes not in security_scopes.scopes:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not enough permissions",
            headers={"WWW-Authenticate": authenticate_value},
        )
    pprint("last")
    return user


async def get_current_active_user(
    current_user: model.User = Security(
        get_current_user,
        scopes=[],
    ),
) -> schema.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_active_superuser(
    current_user: model.User = Depends(get_current_user),
) -> model.User:
    if not current_user.has_role(Role.SUPER_ADMIN):
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


def authenticate_user(db, email: str, password: str):
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
