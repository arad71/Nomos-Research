import typing as t
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.informal_group.schema as schema
from app.db.informal_group.model import InformalGroup as model


def get_informal_group(db: Session, informal_group_id: int):
    informal_group = (
        db.query(model).filter(model.informal_group_id == informal_group_id).first()
    )
    if not informal_group:
        raise HTTPException(status_code=404, detail="InformalGroup not found")
    return informal_group


def get_informal_groups(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.InformalGroupBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_informal_group(
    db: Session, informal_group: schema.InformalGroupCreate, current_user: int
):
    now = datetime.utcnow()
    db_informal_group = model(
        informal_group_name=informal_group.informal_group_name,
        informal_group_desc=informal_group.informal_group_desc,
        created_by=current_user,
        created_on=now,
        updated_by=current_user,
        updated_on=now,
    )
    db.add(db_informal_group)
    db.commit()
    db.refresh(db_informal_group)
    return db_informal_group


def delete_informal_group(db: Session, informal_group_id: int):
    informal_group = get_informal_group(db, informal_group_id)
    if not informal_group:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="InformalGroup not found")
    db.delete(informal_group)
    db.commit()
    return informal_group


def edit_informal_group(
    db: Session,
    informal_group_id: int,
    informal_group: schema.InformalGroupEdit,
    current_user: int,
) -> schema:
    db_informal_group = get_informal_group(db, informal_group_id)
    if not db_informal_group:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="InformalGroup not found")
    update_data = informal_group.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_informal_group, key, value)

    setattr(db_informal_group, "updated_by", current_user)
    setattr(db_informal_group, "updated_on", datetime.utcnow())
    db.add(db_informal_group)
    db.commit()
    db.refresh(db_informal_group)
    return db_informal_group
