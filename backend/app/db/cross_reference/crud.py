import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.cross_reference.model as model
import app.db.cross_reference.schema as schema


def get_cross_reference(db: Session, cross_reference_id: int):
    cross_reference = db.query(model).filter(model.cross_reference_id == cross_reference_id).first()
    if not cross_reference:
        raise HTTPException(status_code=404, detail="CrossReference not found")
    return cross_reference


def get_cross_references(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.CrossReferenceBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_cross_reference(db: Session, cross_reference: schema.CrossReferenceCreate):
    db_cross_reference = model(
        old_name_id=cross_reference.old_name_id,
        new_name_id=cross_reference.new_name_id,
        xref_type=cross_reference.xref_type,
        active=cross_reference.active,
        authorised_by=cross_reference.authorised_by,
        authorised_yr=cross_reference.authorised_yr,
        authorised_mn=cross_reference.authorised_mn,
        authorised_dy=cross_reference.authorised_dy,
        comments=cross_reference.comments,
        notes=cross_reference.notes,
        updated_by=cross_reference.updated_by,
        updated_on=cross_reference.updated_on,
        created_by=cross_reference.created_by,
        created_on=cross_reference.created_on,
    )
    db.add(db_cross_reference)
    db.commit()
    db.refresh(db_cross_reference)
    return db_cross_reference


def delete_cross_reference(db: Session, cross_reference_id: int):
    cross_reference = get_cross_reference(db, cross_reference_id)
    if not cross_reference:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="CrossReference not found")
    db.delete(cross_reference)
    db.commit()
    return cross_reference


def edit_cross_reference(
    db: Session, cross_reference_id: int, cross_reference: schema.CrossReferenceEdit
) -> schema:
    db_cross_reference = get_cross_reference(db, cross_reference_id)
    if not db_cross_reference:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="CrossReference not found")
    update_data = cross_reference.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_cross_reference, key, value)

    db.add(db_cross_reference)
    db.commit()
    db.refresh(db_cross_reference)
    return db_cross_reference
