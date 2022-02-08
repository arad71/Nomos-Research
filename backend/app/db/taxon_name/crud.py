import typing as t

from fastapi import HTTPException, status
from sqlalchemy.orm import Session


import app.db.taxon_name.model as model
import app.db.taxon_name.schema as schema

def get_taxon_name(db: Session, name_id: int):
    taxon_name = db.query(model).filter(model.name_id == name_id).first()
    if not taxon_name:
        raise HTTPException(status_code=404, detail="Taxon Name not found")
    return taxon_name


def get_taxon_names(
    db: Session, skip: int = 0, limit: int = 100
) -> t.List[schema.TaxonNameBase]:
    return db.query(model).offset(skip).limit(limit).all()


def create_taxon_name(db: Session, taxon_name: schema.TaxonNameCreate):
    db_taxon_name = model(
        name_id=taxon_name.name_id,
        kingdom_id=taxon_name.kingdom_id,
        rank_id=taxon_name.rank_id,
        rank_name=taxon_name.rank_name,
        uninomial=taxon_name.uninomial,
        kingdom=taxon_name.kingdom,
        phylum=taxon_name.phylum,
        taxon_class=taxon_name.taxon_class,
        order=taxon_name.order,
        family=taxon_name.family,
        genus=taxon_name.genus,
        subgenus=taxon_name.subgenus,
        scientific_name=taxon_name.scientific_name,
        species=taxon_name.species,
        subspecies=taxon_name.subspecies,
        taxon_rank=taxon_name.taxon_rank,
        specific_epithet=taxon_name.specific_epithet,
        infraspecific_epithet=taxon_name.infraspecific_epithet,
        publication_id=taxon_name.publication_id,
        volume_information=taxon_name.volume_information,
        publication_year=taxon_name.publication_year,
        is_current=taxon_name.is_current,
        origin=taxon_name.origin,
        informal=taxon_name.informal,
        form_desc_yr=taxon_name.form_desc_yr,
        form_desc_mn=taxon_name.form_desc_mn,
        form_desc_dy=taxon_name.form_desc_dy,
        comments=taxon_name.comments,
        contributed_by=taxon_name.contributed_by,
        contributed_on=taxon_name.contributed_on,
        validated=taxon_name.validated,
        source=taxon_name.source,
        external_id=taxon_name.external_id,
        family_code=taxon_name.family_code,
        author=taxon_name.author,
        vernacular=taxon_name.vernacular,
        editor=taxon_name.editor,
        naturalised_status=taxon_name.naturalised_status,
        naturalised_certainty=taxon_name.naturalised_certainty,
        is_eradicated=taxon_name.is_eradicated,
        naturalised_comments=taxon_name.naturalised_comments,
        linear_sequence=taxon_name.linear_sequence,
        family_nid=taxon_name.family_nid,
        all_vernaculars=taxon_name.all_vernaculars,
        notes=taxon_name.notes,
        reference=taxon_name.reference,
        authorised_by=taxon_name.authorised_by,
        authorised_on=taxon_name.authorised_on,
        updated_by=taxon_name.updated_by,
        updated_on=taxon_name.updated_on,
        created_by=taxon_name.created_by,
        created_on=taxon_name.created_on,
    )
    db.add(db_taxon_name)
    db.commit()
    db.refresh(db_taxon_name)
    return db_taxon_name


def delete_taxon_name(db: Session, name_id: int):
    taxon_name = get_taxon_name(db, name_id)
    if not taxon_name:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Taxon Name not found")
    db.delete(taxon_name)
    db.commit()
    return taxon_name


def edit_taxon_name(
    db: Session, name_id: int, taxon_name: schema.TaxonNameEdit
) -> schema:
    db_taxon_name = get_taxon_name(db, name_id)
    if not db_taxon_name:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Taxon Name not found")
    update_data = taxon_name.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_taxon_name, key, value)

    db.add(db_taxon_name)
    db.commit()
    db.refresh(db_taxon_name)
    return db_taxon_name
