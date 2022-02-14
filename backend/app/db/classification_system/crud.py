import typing as t
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.classification_system.schema as schema
from app.db.classification_system.model import ClassificationSystem as model


def get_classification_system(db: Session, classification_system_id: int):
    classification_system = (
        db.query(model)
        .filter(model.classification_system_id == classification_system_id)
        .first()
    )
    if not classification_system:
        raise HTTPException(status_code=404, detail="Classification System not found")
    return classification_system


def get_classification_systems(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.ClassificationSystemBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_classification_system(
    db: Session,
    classification_system: schema.ClassificationSystemCreate,
    current_user: int,
):
    db_classification_system = model(
        class_desc=classification_system.class_desc,
        class_type=classification_system.class_type,
        preferred=classification_system.preferred,
        sort_order=classification_system.sort_order,
        created_by=current_user,
        updated_by=current_user,
    )
    db.add(db_classification_system)
    db.commit()
    db.refresh(db_classification_system)
    return db_classification_system


def delete_classification_system(db: Session, classification_system_id: int):
    classification_system = get_classification_system(db, classification_system_id)
    if not classification_system:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, detail="Classification System not found"
        )
    db.delete(classification_system)
    db.commit()
    return classification_system


def edit_classification_system(
    db: Session,
    classification_system_id: int,
    classification_system: schema.ClassificationSystemEdit,
    current_user: int,
) -> schema:
    db_classification_system = get_classification_system(db, classification_system_id)
    if not db_classification_system:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, detail="Classification System not found"
        )
    update_data = classification_system.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_classification_system, key, value)

    setattr(db_classification_system, "updated_by", current_user)
    db.add(db_classification_system)
    db.commit()
    db.refresh(db_classification_system)
    return db_classification_system
