import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.kingdom.schema as schema
from app.db.kingdom.model import Kingdom as model


def get_kingdom(db: Session, kingdom_id: int):
    kingdom = db.query(model).filter(model.kingdom_id == kingdom_id).first()
    if not kingdom:
        raise HTTPException(status_code=404, detail="Kingdom not found")
    return kingdom


def get_kingdoms(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.KingdomBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_kingdom(db: Session, kingdom: schema.KingdomCreate, current_user: int):
    db_kingdom = model(
        kingdom_name=kingdom.kingdom_name,
        kingdom_desc=kingdom.kingdom_desc,
        created_by=current_user,
        updated_by=current_user,
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
    db: Session, kingdom_id: int, kingdom: schema.KingdomEdit, current_user: int
) -> schema:
    db_kingdom = get_kingdom(db, kingdom_id)
    if not db_kingdom:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Kingdom not found")
    update_data = kingdom.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_kingdom, key, value)

    setattr(db_kingdom, "updated_by", current_user)
    db.add(db_kingdom)
    db.commit()
    db.refresh(db_kingdom)
    return db_kingdom
