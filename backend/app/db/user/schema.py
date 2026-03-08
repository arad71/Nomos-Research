import typing as t
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.config import settings
from app.db.role.constants import Role
from app.db.user.constants import EMAIL, TABLE_DESCRIPTION
from app.db.user_role.schema import UserRole


class UserBase(BaseModel):
    email: str = Field(description=EMAIL)
    deleted: bool = False
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    legacy_id_name: Optional[str] = None
    role_names: Optional[list[str]] = None
    role_ids: Optional[list[int]] = None


class UserOut(UserBase):
    pass


class UserCreate(UserBase):
    if settings.AUTH_PROVIDER == "auth2":
        password: t.Optional[str] = None
    else:
        password: str = None
    model_config = ConfigDict(
        from_attributes=True, json_schema_extra={"description": TABLE_DESCRIPTION}
    )


class UserEdit(UserBase):
    password: t.Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class User(UserBase):
    user_id: int
    user_role: Optional[list[UserRole]] = None
    full_name: Optional[str] = None
    updated_by: Optional[int] = None
    updated_on: Optional[datetime] = None
    created_by: Optional[int] = None
    created_on: Optional[datetime] = None
    deleted: bool

    # class Config:
    #     orm_mode = True

    # ✔ Pydantic v2 config
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str = None
    scopes: list[str] = [Role.READER]
