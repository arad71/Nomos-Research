import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.user.schema as schema
from app.core.security import get_password_hash
from app.db.user.model import User as model


def get_user(db: Session, user_id: int):
    user = db.query(model).filter(model.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_user_by_email(db: Session, email: str) -> schema.UserBase:
    return db.query(model).filter(model.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> t.List[schema.UserOut]:
    return db.query(model).offset(skip).limit(limit).all()


def create_user(db: Session, user: schema.UserCreate):
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


def delete_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return user


def edit_user(db: Session, user_id: int, user: schema.UserEdit) -> schema.User:
    db_user = get_user(db, user_id)
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
