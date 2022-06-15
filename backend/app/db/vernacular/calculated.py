from sqlalchemy import orm

from app.db.taxon_name.model import TaxonName
from app.db.session import SessionLocal


def calculate_fields(mapper, connection, target):
    trigger_taxon_name_calculated_fields(target)


def trigger_taxon_name_calculated_fields(target):
    db = SessionLocal()
    taxon_name_id = target.taxon_name_id
    taxon_names = db.query(TaxonName).filter(TaxonName.taxon_name_id == taxon_name_id)
    for taxon_name in taxon_names:
        orm.attributes.flag_dirty(taxon_name)
        db.add(taxon_name)
    db.commit()
