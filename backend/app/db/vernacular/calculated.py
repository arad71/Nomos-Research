from sqlalchemy import orm

from app.db.taxon_name.model import TaxonName


def trigger_taxon_name_calculated_fields(session, target):
    taxon_name_id = target.taxon_name_id
    taxon_names = session.query(TaxonName).filter(
        TaxonName.taxon_name_id == taxon_name_id
    )
    for taxon_name in taxon_names:
        orm.attributes.flag_dirty(taxon_name)
        session.add(taxon_name)
    return session
