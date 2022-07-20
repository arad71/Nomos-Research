from datetime import timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core import security
from app.core.auth import auth2_authenticate_user, authenticate_user, use_auth2
from app.db.session import get_db

auth_router = r = APIRouter()


@r.post("/token")
async def login(db=Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to authenticate user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    roles = []
    for user_role in user.user_role:
        roles.append(user_role.role.name)
    access_token = security.create_access_token(
        data={"sub": user.email, "scopes": roles},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": user.user_id,
        "full_name": f"{user.first_name} {user.last_name}",
    }


@r.post("/auth2token")
async def auth2login(
    db=Depends(get_db),
    use_auth2=Depends(use_auth2),
    x_email: str = Header(default=None),
    x_first_name: str = Header(default=None),
    x_last_name: str = Header(default=None),
    x_logout_url: str = Header(default=None),
):
    if not x_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to authenticate user.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = auth2_authenticate_user(db, x_email, x_first_name, x_last_name)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to authenticate user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    roles = []
    for user_role in user.user_role:
        roles.append(user_role.role.name)
    access_token = security.create_access_token(
        data={"sub": user.email, "scopes": roles, "logout_url": x_logout_url},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": user.user_id,
        "full_name": f"{x_first_name} {x_last_name}"
    }
