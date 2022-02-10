import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.kingdom.model import Kingdom as model
import app.db.kingdom.schema as schema


def get_kingdom(db: Session, kingdom_id: int):
    kingdom = db.query(model).filter(model.kingdom_id == kingdom_id).first()
    if not kingdom:
        raise HTTPException(status_code=404, detail="Kingdom not found")
    return kingdom


def get_kingdoms(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.KingdomBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_kingdom(db: Session, kingdom: schema.KingdomCreate):
    db_kingdom = model(
        kingdom_name=kingdom.kingdom_name,
        kingdom_desc=kingdom.kingdom_desc,
        updated_by=kingdom.updated_by,
        updated_on=kingdom.updated_on,
        created_by=kingdom.created_by,
        created_on=kingdom.created_on,
    )
    db.add(db_kingdom)
    db.commit()
    db.refresh(db_kingdom)
    return db_kingdom


def delete_kingdom(db: Session, kingdom_id: int):
    kingdom = get_kingdom(db, kingdom_id)
    if not kingdom:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Kingdom not found")
    db.delete(kingdom)
    db.commit()
    return kingdom


def edit_kingdom(
    db: Session, kingdom_id: int, kingdom: schema.KingdomEdit
) -> schema:
    db_kingdom = get_kingdom(db, kingdom_id)
    if not db_kingdom:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Kingdom not found")
    update_data = kingdom.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_kingdom, key, value)

    db.add(db_kingdom)
    db.commit()
    db.refresh(db_kingdom)
    return db_kingdom
