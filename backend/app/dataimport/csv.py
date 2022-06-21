import os

from loguru import logger

from app.dataimport.wacensus import get_admin_id, trigger_calculated_fields
from app.db.session import SessionLocal
from app.db.taxon_name.dataimport import ImportTaxonNameUpload


def import_taxon_names(csvfile, mapping_type):
    db = SessionLocal()
    admin_id = get_admin_id(db)
    ImportTaxonNameUpload(db, admin_id, csvfile, mapping_type).ingest()
    csv_name = os.path.split(csvfile)[1].split(".")[0]
    trigger_calculated_fields(db, legacy_id_prefix=csv_name)
    logger.info(f"Imported {csv_name}.")
