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
    # Create 1st Superuser
    password = settings.FIRST_SUPER_ADMIN_PASSWORD
    user = ensure_user(
        db,
        settings.FIRST_SUPER_ADMIN_EMAIL,
        settings.FIRST_SUPER_ADMIN_FIRST_NAME,
        settings.FIRST_SUPER_ADMIN_LAST_NAME,
        password,
    )
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
            if settings.ENVIRONMENT == "local":
                demo_user = ensure_user(
                    db, f"{role_name}@example.com", role_name, "Demo User", password
                )
                ensure_user_has_role(db, role_name, demo_user)

    # Assign super_admin role to user

    ensure_user_has_role(db, Role.SUPER_ADMIN["name"], user)


def ensure_user_has_role(db, role_name, user):
    user_role = UserRoleCrud.get_by_property(db, property="user_id", value=user.user_id)
    if not user_role:
        role = RoleCrud.get_by_name(db, name=role_name)
        user_role_in = UserRoleCreate(
            user_id=user.user_id,
            role_id=role.role_id,
            created_by=settings.FIRST_SUPER_ADMIN_USER_ID,
            updated_by=settings.FIRST_SUPER_ADMIN_USER_ID,
        )
        UserRoleCrud.create_item(
            db, item=user_role_in, current_user=settings.FIRST_SUPER_ADMIN_USER_ID
        )


def ensure_user(db, email, first_name, last_name, password):
    user_crud = UserCrud()
    user = user_crud.get_user_by_email(db, email=email)
    if user:
        logger.debug("User {} exists", email)
    else:
        logger.debug("Creating user {}", email)
        user_in = UserCreate(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        user = user_crud.create_item(
            db=db, user=user_in, current_user=settings.FIRST_SUPER_ADMIN_USER_ID
        )
    return user
