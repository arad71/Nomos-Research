import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import ConservationStatus as Model
import app.db.schemas as schema


def get_conservation_status(db: Session, name_id: int):
    conservation_status = db.query(Model).filter(Model.name_id == name_id).first()
    if not conservation_status:
        raise HTTPException(status_code=404, detail="Conservation Status not found")
    return conservation_status


def get_conservation_statuss(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.ConservationStatusBase]:
    return db.query(Model).offset(skip).limit(limit).all()


def create_conservation_status(db: Session, conservation_status: schema.ConservationStatusCreate):
    db_conservation_status = Model(
        name_id=conservation_status.name_id,
        consv_code=conservation_status.consv_code,
        list_code=conservation_status.list_code,
        epbc=conservation_status.epbc,
        wa_iucn=conservation_status.wa_iucn,
        iucn_criteria=conservation_status.iucn_criteria,
        updated_by=conservation_status.updated_by,
        updated_on=conservation_status.updated_on,
        created_by=conservation_status.created_by,
        created_on=conservation_status.created_on,
    )
    db.add(db_conservation_status)
    db.commit()
    db.refresh(db_conservation_status)
    return db_conservation_status


def delete_conservation_status(db: Session, name_id: int):
    conservation_status = get_conservation_status(db, name_id)
    if not conservation_status:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="ConservationStatus not found")
    db.delete(conservation_status)
    db.commit()
    return conservation_status


def edit_conservation_status(
    db: Session, name_id: int, conservation_status: schema.ConservationStatusEdit
) -> schema:
    db_conservation_status = get_conservation_status(db, name_id)
    if not db_conservation_status:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="ConservationStatus not found")
    update_data = conservation_status.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_conservation_status, key, value)

    db.add(db_conservation_status)
    db.commit()
    db.refresh(db_conservation_status)
    return db_conservation_status
