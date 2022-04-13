from typing import Optional

from pydantic import BaseModel

from app.db.role.constants import TABLE_DESCRIPTION


class RoleBase(BaseModel):
    name: str
    description: Optional[str]


# Properties to receive via API on creation
class RoleCreate(RoleBase):
    pass


# Properties to receive via API on update
class RoleEdit(RoleBase):
    pass


class Role(RoleBase):
    role_id: int

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
