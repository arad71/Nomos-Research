import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import NameId as Model
import app.db.schemas as schema


def get_name_id(db: Session, name_id: int):
    name_id = db.query(Model).filter(Model.name_id == name_id).first()
    if not name_id:
        raise HTTPException(status_code=404, detail="NameId not found")
    return name_id


def get_name_ids(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.NameIdBase]:
    return db.query(Model).offset(skip).limit(limit).all()


def create_name_id(db: Session, name_id: schema.NameIdCreate):
    db_name_id = Model(
        external_name_id=name_id.external_name_id,
        kingdom_id=name_id.kingdom_id,
        rank_id=name_id.rank_id,
        rank_name=name_id.rank_name,
        name1=name_id.name1,
        name2=name_id.name2,
        rank3=name_id.rank3,
        name3=name_id.name3,
        rank4=name_id.rank4,
        name4=name_id.name4,
        author=name_id.author,
        created_by_app=name_id.created_by_app,
        claimed=name_id.claimed,
        updated_by_app=name_id.updated_by_app,
        updated_by=name_id.updated_by,
        updated_on=name_id.updated_on,
        created_by=name_id.created_by,
        created_on=name_id.created_on,
    )
    db.add(db_name_id)
    db.commit()
    db.refresh(db_name_id)
    return db_name_id


def delete_name_id(db: Session, name_id: int):
    name_id = get_name_id(db, name_id)
    if not name_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="NameId not found")
    db.delete(name_id)
    db.commit()
    return name_id


def edit_name_id(
    db: Session, name_id: int, name_id_id: schema.NameIdEdit
) -> schema:
    db_name_id = get_name_id(db, name_id_id)
    if not db_name_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="NameId not found")
    update_data = name_id.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_name_id, key, value)

    db.add(db_name_id)
    db.commit()
    db.refresh(db_name_id)
    return db_name_id
