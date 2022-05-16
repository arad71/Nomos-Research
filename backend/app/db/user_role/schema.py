from typing import Optional

from pydantic import BaseModel

from app.db.role.schema import Role
from app.db.schemas import TableBase

# Shared properties
from app.db.user_role.constants import TABLE_DESCRIPTION


class UserRoleBase(BaseModel):
    user_id: Optional[int]
    role_id: Optional[int]


# Properties to receive via API on creation
class UserRoleCreate(UserRoleBase):
    pass


# Properties to receive via API on update
class UserRoleEdit(UserRoleBase):
    pass


class UserRole(UserRoleBase, TableBase):
    user_role_id: int
    role: Role

    class Config:
        orm_mode = True
        schema_extra = {"description": TABLE_DESCRIPTION}
