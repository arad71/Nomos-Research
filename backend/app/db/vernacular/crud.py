import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.vernacular.model import Vernacular as model
import app.db.vernacular.schema as schema

def get_vernacular(db: Session, vernacular_id: int):
    vernacular = db.query(model).filter(model.vernacular_id == vernacular_id).first()
    if not vernacular:
        raise HTTPException(status_code=404, detail="Vernacular not found")
    return vernacular


def get_vernaculars(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.VernacularBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_vernacular(db: Session, vernacular: schema.VernacularCreate):
    db_vernacular = model(
        vernacular=vernacular.vernacular,
        language=vernacular.language,
        lang_pref=vernacular.lang_pref,
        preferred=vernacular.preferred,
        source=vernacular.source,
        enabled=vernacular.enabled,
        sort_order=vernacular.sort_order,
        updated_by=vernacular.updated_by,
        updated_on=vernacular.updated_on,
        created_by=vernacular.created_by,
        created_on=vernacular.created_on,
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
    db: Session, vernacular_id: int, vernacular: schema.VernacularEdit
) -> schema:
    db_vernacular = get_vernacular(db, vernacular_id)
    if not db_vernacular:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Vernacular not found")
    update_data = vernacular.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_vernacular, key, value)

    db.add(db_vernacular)
    db.commit()
    db.refresh(db_vernacular)
    return db_vernacular
