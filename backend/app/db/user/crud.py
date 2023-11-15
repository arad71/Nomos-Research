from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.crud as crud
import app.db.user.schema as schema
from app.core.security import get_password_hash
from app.db.user.model import User
from app.db.user.schema import User as UserSchema
from app.db.user_role.model import UserRole


class UserCrud(crud.Crud):
    model = User
    id_key = "user_id"
    name = "User"
    search_fields = ["email", "first_name", "last_name"]

    @classmethod
    def get_user_by_email(cls, db: Session, email: str) -> User:
        return (
            db.query(User)
            .filter(User.email == email, User.deleted == False)  # noqa: E712
            .one_or_none()
        )

    @classmethod
    def create_item(
        cls,
        db: Session,
        user: schema.UserCreate,
        raise_exception: bool = True,
        current_user: int = None,
    ):
        if not user.password:
            user.password = str(uuid4())
        hashed_password = get_password_hash(user.password)
        db_user = User(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            deleted=user.deleted,
            hashed_password=hashed_password,
            created_by=current_user,
            updated_by=current_user,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        user_id = db_user.user_id
        if user.role_ids:
            for role_id in user.role_ids:
                user_role = UserRole(
                    user_id=user_id,
                    role_id=role_id,
                    created_by=current_user,
                    updated_by=current_user,
                )
                db.add(user_role)
            db.commit()
        return db_user

    @classmethod
    def edit_item(
        cls,
        db: Session,
        current_user: UserSchema,
        user_id: int,
        user: schema.UserEdit,
        **kwargs,
    ) -> User:
        db_user = UserCrud.get_item(db, current_user, user_id)
        if not db_user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found")
        update_data = user.dict(exclude_unset=True)
        update_data.pop("role_names", None)

        if "role_ids" in update_data:
            role_ids = update_data["role_ids"]
            db.query(UserRole).filter(
                UserRole.user_id == user_id,
                ~UserRole.role_id.in_(role_ids),
            ).delete()
            current_role_ids = [
                role_id[0]
                for role_id in db.query(UserRole.role_id)
                .filter(UserRole.user_id == user_id)
                .all()
            ]
            new_role_ids = set(role_ids) ^ set(current_role_ids)
            for role_id in new_role_ids:
                user_role = UserRole(
                    user_id=user_id,
                    role_id=role_id,
                    created_by=current_user.user_id,
                    updated_by=current_user.user_id,
                )
                db.add(user_role)

        update_data.pop("role_ids", None)
        update_data["updated_by"] = current_user.user_id

        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(user.password)
            del update_data["password"]

        for key, value in update_data.items():
            setattr(db_user, key, value)

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
