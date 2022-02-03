import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import ClassificationSystem as Model
import app.db.schemas as schema


def get_classification_system(db: Session, classification_system_id: int):
    classification_system = db.query(Model).filter(Model.classification_system_id == classification_system_id).first()
    if not classification_system:
        raise HTTPException(status_code=404, detail="Classification System not found")
    return classification_system


def get_classification_systems(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.ClassificationSystemBase]:
    return db.query(Model).offset(skip).limit(limit).all()


def create_classification_system(db: Session, classification_system: schema.ClassificationSystemCreate):
    db_classification_system = Model(
        class_desc=classification_system.class_desc,
        class_type=classification_system.class_type,
        preferred=classification_system.preferred,
        sort_order=classification_system.sort_order,
        updated_by=classification_system.updated_by,
        updated_on=classification_system.updated_on,
        created_by=classification_system.created_by,
        created_on=classification_system.created_on,
    )
    db.add(db_classification_system)
    db.commit()
    db.refresh(db_classification_system)
    return db_classification_system


def delete_classification_system(db: Session, classification_system_id: int):
    classification_system = get_classification_system(db, classification_system_id)
    if not classification_system:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Classification System not found")
    db.delete(classification_system)
    db.commit()
    return classification_system


def edit_classification_system(
    db: Session, classification_system_id: int, classification_system: schema.ClassificationSystemEdit
) -> schema:
    db_classification_system = get_classification_system(db, classification_system_id)
    if not db_classification_system:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Classification System not found")
    update_data = classification_system.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_classification_system, key, value)

    db.add(db_classification_system)
    db.commit()
    db.refresh(db_classification_system)
    return db_classification_system
