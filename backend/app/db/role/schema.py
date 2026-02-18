from __future__ import annotations

from typing import Optional

from pydantic import BaseModel
from pydantic.config import ConfigDict

from app.db.role.constants import TABLE_DESCRIPTION


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None


# Properties to receive via API on creation
class RoleCreate(RoleBase):
    model_config = ConfigDict(from_attributes=True)


# Properties to receive via API on update
class RoleEdit(RoleBase):
    model_config = ConfigDict(from_attributes=True)


class Role(RoleBase):
    role_id: int

    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode=True
        json_schema_extra={"description": TABLE_DESCRIPTION},
    )
