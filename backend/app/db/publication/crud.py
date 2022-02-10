import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.publication.schema as schema
from app.db.publication.model import Publication as model


def get_publication(db: Session, publication_id: int):
    publication = (
        db.query(model).filter(model.publication_id == publication_id).first()
    )
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    return publication


def get_publications(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.PublicationBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_publication(db: Session, publication: schema.PublicationCreate):
    db_publication = model(
        bad_publication=publication.bad_publication,
        publication=publication.publication,
        publication_name=publication.publication_name,
        updated_by=publication.updated_by,
        updated_on=publication.updated_on,
        created_by=publication.created_by,
        created_on=publication.created_on,
    )
    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)
    return db_publication


def delete_publication(db: Session, publication_id: int):
    publication = get_publication(db, publication_id)
    if not publication:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, detail="Publication not found"
        )
    db.delete(publication)
    db.commit()
    return publication


def edit_publication(
    db: Session, publication_id: int, publication: schema.PublicationEdit
) -> schema:
    db_publication = get_publication(db, publication_id)
    if not db_publication:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, detail="Publication not found"
        )
    update_data = publication.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_publication, key, value)

    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)
    return db_publication
