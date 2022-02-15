import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.citation.schema as schema
from app.db.citation.model import Citation as model


def get_citation(db: Session, citation_id: int):
    citation = db.query(model).filter(model.citation_id == citation_id).first()
    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")
    return citation


def get_citations(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.CitationBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_citation(db: Session, citation: schema.CitationCreate, current_user: int):
    db_citation = model(
        taxon_name_id=citation.taxon_name_id,
        author_id=citation.author_id,
        author_type=citation.author_type,
        author_order=citation.author_order,
        created_by=current_user,
        updated_by=current_user,
    )
    db.add(db_citation)
    db.commit()
    db.refresh(db_citation)
    return db_citation


def delete_citation(db: Session, citation_id: int):
    citation = get_citation(db, citation_id)
    if not citation:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Citation not found")
    db.delete(citation)
    db.commit()
    return citation


def edit_citation(
    db: Session, citation_id: int, citation: schema.CitationEdit, current_user: int
) -> schema:
    db_citation = get_citation(db, citation_id)
    if not db_citation:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Citation not found")
    update_data = citation.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_citation, key, value)

    setattr(db_citation, "updated_by", current_user)
    db.add(db_citation)
    db.commit()
    db.refresh(db_citation)
    return db_citation
