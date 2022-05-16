import typing as t
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.db.role.constants import Role
from app.db.user.constants import EMAIL, TABLE_DESCRIPTION
from app.db.user_role.schema import UserRole


class UserBase(BaseModel):
    email: str = Field(description=EMAIL)
    is_active: bool = True
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    legacy_id_name: Optional[str] = None
    role_names: Optional[list[str]]
    role_ids: Optional[list[int]]


class UserOut(UserBase):
    pass


class UserCreate(UserBase):
    password: str

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}


class UserEdit(UserBase):
    password: t.Optional[str] = None

    class Config:
        orm_mode = True


class User(UserBase):
    user_id: int
    user_role: Optional[list[UserRole]]
    full_name: Optional[str]
    updated_by: Optional[int]
    updated_on: Optional[datetime]
    created_by: Optional[int]
    created_on: Optional[datetime]

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str = None
    scopes: list[str] = [Role.READER]
