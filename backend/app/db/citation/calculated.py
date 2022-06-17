from sqlalchemy import orm

from app.db.taxon_name.model import TaxonName


def trigger_taxon_name_calculated_fields(session: orm.Session, target=None, crud=None):
    if crud == "delete":
        taxon_name_id = target
        taxon_names = (
            session.query(TaxonName)
            .filter(TaxonName.taxon_name_id == taxon_name_id)
            .all()
        )
        for taxon_name in taxon_names:
            orm.attributes.flag_dirty(taxon_name)
            session.add(taxon_name)
