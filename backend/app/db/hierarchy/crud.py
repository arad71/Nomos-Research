import typing as t
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.hierarchy.model as model
import app.db.hierarchy.schema as schema


def get_hierarchy(db: Session, hierarchy_id: int):
    hierarchy = (
        db.query(model).filter(model.Hierarchy.hierarchy_id == hierarchy_id).first()
    )
    if not hierarchy:
        raise HTTPException(status_code=404, detail="Hierarchy not found")
    return hierarchy


def get_hierarchies(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.HierarchyBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_hierarchy(db: Session, hierarchy: schema.HierarchyCreate, current_user: int):
    now = datetime.utcnow()
    db_hierarchy = model(
        classification_system_id=hierarchy.classification_system_id,
        parent_nid=hierarchy.parent_nid,
        created_by=current_user,
        created_on=now,
        updated_by=current_user,
        updated_on=now,
    )
    db.add(db_hierarchy)
    db.commit()
    db.refresh(db_hierarchy)
    return db_hierarchy


def delete_hierarchy(db: Session, hierarchy_id: int):
    hierarchy = get_hierarchy(db, hierarchy_id)
    if not hierarchy:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Hierarchy not found")
    db.delete(hierarchy)
    db.commit()
    return hierarchy


def edit_hierarchy(
    db: Session, hierarchy_id: int, hierarchy: schema.HierarchyEdit, current_user: int
) -> schema:
    db_hierarchy = get_hierarchy(db, hierarchy_id)
    if not db_hierarchy:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Hierarchy not found")
    update_data = hierarchy.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_hierarchy, key, value)

    setattr(db_hierarchy, "updated_by", current_user)
    setattr(db_hierarchy, "updated_on", datetime.utcnow())
    db.add(db_hierarchy)
    db.commit()
    db.refresh(db_hierarchy)
    return db_hierarchy
