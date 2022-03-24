from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.role.constants import Role
from app.db.role.crud import RoleCrud
from app.db.role.schema import RoleCreate
from app.db.user.crud import UserCrud
from app.db.user.schema import UserCreate
from app.db.user_role.crud import UserRoleCrud
from app.db.user_role.schema import UserRoleCreate


def init_db(db: Session) -> None:
    logger.info("Initializing database")
    user_crud = UserCrud()
    # Create 1st Superuser
    user = user_crud.get_user_by_email(db, email=settings.FIRST_SUPER_ADMIN_EMAIL)
    if not user:
        logger.debug("Creating user")
        user_in = UserCreate(
            email=settings.FIRST_SUPER_ADMIN_EMAIL,
            password=settings.FIRST_SUPER_ADMIN_PASSWORD,
            first_name=settings.FIRST_SUPER_ADMIN_FIRST_NAME,
            last_name=settings.FIRST_SUPER_ADMIN_LAST_NAME,
        )
        user = user_crud.create_item(db=db, user=user_in)
    # Create Role If They Don't Exist

    for role_name, role_value in Role.__dict__.items():
        if role_name[:2] != "__":  # skip private properties / methods
            role_instance = RoleCrud.get_by_name(db=db, name=role_value.get("name"))
            if not role_instance:
                logger.debug("Creating role {}", role_name)
                role_in = RoleCreate(
                    name=role_value.get("name"),
                    description=role_value.get("description"),
                )
                RoleCrud.create_item(db, item=role_in)
            else:
                logger.debug("Role {} exists", role_name)

    # Assign super_admin role to user
    user_role = UserRoleCrud.get_by_property(db, property="user_id", value=user.user_id)
    if not user_role:
        role = RoleCrud.get_by_name(db, name=Role.SUPER_ADMIN["name"])
        user_role_in = UserRoleCreate(user_id=user.user_id, role_id=role.role_id)
        UserRoleCrud.create_item(db, item=user_role_in)
