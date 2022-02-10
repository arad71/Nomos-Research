import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.informal_group.model import InformalGroup as model
import app.db.informal_group.schema as schema


def get_informal_group(db: Session, informal_group_id: int):
    informal_group = db.query(model).filter(model.informal_group_id == informal_group_id).first()
    if not informal_group:
        raise HTTPException(status_code=404, detail="InformalGroup not found")
    return informal_group


def get_informal_groups(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.InformalGroupBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_informal_group(db: Session, informal_group: schema.InformalGroupCreate):
    db_informal_group = model(
        informal_group_name=informal_group.informal_group_name,
        informal_group_desc=informal_group.informal_group_desc,
        updated_by=informal_group.updated_by,
        updated_on=informal_group.updated_on,
        created_by=informal_group.created_by,
        created_on=informal_group.created_on,
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
    db: Session, informal_group_id: int, informal_group: schema.InformalGroupEdit
) -> schema:
    db_informal_group = get_informal_group(db, informal_group_id)
    if not db_informal_group:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="InformalGroup not found")
    update_data = informal_group.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_informal_group, key, value)

    db.add(db_informal_group)
    db.commit()
    db.refresh(db_informal_group)
    return db_informal_group
