from sqlalchemy import orm

from app.db.conscode_taxon.model import Conscodetaxon


def trigger_taxon_name_calculated_fields(
    session: orm.Session, conservation_code_id: int
):
    conscode_taxons = (
        session.query(Conscodetaxon)
        .filter(Conscodetaxon.conservation_code_id == conservation_code_id)
        .all()
    )
    for conscode_taxon in conscode_taxons:
        orm.attributes.flag_dirty(conscode_taxon)
        session.add(conscode_taxon)
