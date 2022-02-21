import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.crud as crud
import app.db.user.schema as schema
from app.core.security import get_password_hash
from app.db.user.model import User
from app.db.user.model import User as model


class UserCrud(crud.Crud):
    model = User
    id_key = "user_id"
    name = "User"

    @classmethod
    def get_user_by_email(cls, db: Session, email: str) -> schema.UserBase:
        return db.query(model).filter(model.email == email).first()

    @classmethod
    def create_item(cls, db: Session, user: schema.UserCreate):
        hashed_password = get_password_hash(user.password)
        db_user = model(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            is_active=user.is_active,
            is_superuser=user.is_superuser,
            hashed_password=hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @classmethod
    def edit_item(cls, db: Session, user_id: int, user: schema.UserEdit) -> schema.User:
        db_user = UserCrud.get_item(db, user_id)
        if not db_user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found")
        update_data = user.dict(exclude_unset=True)

        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(user.password)
            del update_data["password"]

        for key, value in update_data.items():
            setattr(db_user, key, value)

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
