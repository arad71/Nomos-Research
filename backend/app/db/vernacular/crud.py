import typing as t
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.vernacular.schema as schema
from app.db.vernacular.model import Vernacular as model


def get_vernacular(db: Session, vernacular_id: int):
    vernacular = db.query(model).filter(model.vernacular_id == vernacular_id).first()
    if not vernacular:
        raise HTTPException(status_code=404, detail="Vernacular not found")
    return vernacular


def get_vernaculars(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.VernacularBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_vernacular(
    db: Session, vernacular: schema.VernacularCreate, current_user: int
):
    now = datetime.utcnow()
    db_vernacular = model(
        vernacular=vernacular.vernacular,
        language=vernacular.language,
        lang_pref=vernacular.lang_pref,
        preferred=vernacular.preferred,
        source=vernacular.source,
        enabled=vernacular.enabled,
        sort_order=vernacular.sort_order,
        created_by=current_user,
        created_on=now,
        updated_by=current_user,
        updated_on=now,
    )
    db.add(db_vernacular)
    db.commit()
    db.refresh(db_vernacular)
    return db_vernacular


def delete_vernacular(db: Session, vernacular_id: int):
    vernacular = get_vernacular(db, vernacular_id)
    if not vernacular:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Vernacular not found")
    db.delete(vernacular)
    db.commit()
    return vernacular


def edit_vernacular(
    db: Session,
    vernacular_id: int,
    vernacular: schema.VernacularEdit,
    current_user: int,
) -> schema:
    db_vernacular = get_vernacular(db, vernacular_id)
    if not db_vernacular:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Vernacular not found")
    update_data = vernacular.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_vernacular, key, value)

    setattr(db_vernacular, "updated_by", current_user)
    setattr(db_vernacular, "updated_on", datetime.utcnow())
    db.add(db_vernacular)
    db.commit()
    db.refresh(db_vernacular)
    return db_vernacular
