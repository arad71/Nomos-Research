import typing as t
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import app.db.taxon_rank.schema as schema
from app.db.taxon_rank.model import TaxonRank as model


def get_taxon_rank(db: Session, taxon_rank_id: int):
    taxon_rank = db.query(model).filter(model.taxon_rank_id == taxon_rank_id).first()
    if not taxon_rank:
        raise HTTPException(status_code=404, detail="TaxonRank not found")
    return taxon_rank


def get_taxon_ranks(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.TaxonRankBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_taxon_rank(
    db: Session, taxon_rank: schema.TaxonRankCreate, current_user: int
):
    now = datetime.utcnow()
    db_taxon_rank = model(
        kingdom_id=taxon_rank.kingdom_id,
        rank_name=taxon_rank.rank_name,
        rank_abbrev=taxon_rank.rank_abbrev,
        direct_parent_rank_id=taxon_rank.direct_parent_rank_id,
        required_parent_rank_id=taxon_rank.required_parent_rank_id,
        created_by=current_user,
        created_on=now,
        updated_by=current_user,
        updated_on=now,
    )
    db.add(db_taxon_rank)
    db.commit()
    db.refresh(db_taxon_rank)
    return db_taxon_rank


def delete_taxon_rank(db: Session, taxon_rank_id: int):
    taxon_rank = get_taxon_rank(db, taxon_rank_id)
    if not taxon_rank:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="TaxonRank not found")
    db.delete(taxon_rank)
    db.commit()
    return taxon_rank


def edit_taxon_rank(
    db: Session, taxon_rank_id: int, taxon_rank: schema.TaxonRankEdit, current_user: int
) -> schema:
    db_taxon_rank = get_taxon_rank(db, taxon_rank_id)
    if not db_taxon_rank:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="TaxonRank not found")
    update_data = taxon_rank.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_taxon_rank, key, value)

    setattr(db_taxon_rank, "updated_by", current_user)
    setattr(db_taxon_rank, "updated_on", datetime.utcnow())
    db.add(db_taxon_rank)
    db.commit()
    db.refresh(db_taxon_rank)
    return db_taxon_rank
