import os
import shutil
from uuid import uuid4
from zipfile import ZipFile

import requests
from loguru import logger
from pydantic import AnyUrl
from sqlalchemy import orm

from app.core.config import settings
from app.db.author.dataimport import ImportAuthor
from app.db.citation.dataimport import ImportCitation
from app.db.classification_system.dataimport import ImportClassificationSystem
from app.db.cross_reference.dataimport import ImportCrossReference
from app.db.dataimport import LEGACY_DATA_DIRECTORY
from app.db.hierarchy.dataimport import ImportHierarchy
from app.db.informal_group.dataimport import ImportInformalGroup
from app.db.kingdom.dataimport import ImportKingdom
from app.db.publication.dataimport import ImportPublication
from app.db.session import SessionLocal
from app.db.taxon_name.dataimport import ImportTaxonName, ImportTaxonNameFamilyNid
from app.db.taxon_name.model import TaxonName
from app.db.taxon_rank.dataimport import ImportTaxonRank
from app.db.user.crud import UserCrud
from app.db.user.dataimport import ImportUser, ImportUserDefaults
from app.db.user.schema import UserCreate
from app.db.vernacular.dataimport import ImportVernacular


def get_admin_id(db: SessionLocal):
    admin_email = "wacensus-migration@bdr.wa.gov.au"
    admin = UserCrud.get_user_by_email(db=db, email=admin_email)
    if not admin:
        admin = UserCrud.create_item(
            db,
            UserCreate(email=admin_email, is_active=False, password=str(uuid4())),
        )
    return admin.user_id


def trigger_calculated_fields(db):
    # Calculate fields after related data imported
    line_count = 0
    logger.debug("Triggering calculated fields")
    for r in db.query(TaxonName).all():
        orm.attributes.flag_dirty(r)
        db.add(r)
        line_count += 1
        if line_count % 100 == 0:
            db.commit()
            if line_count % 10000 == 0:
                logger.debug(f"Processed {line_count}")
    db.commit()


def import_data(url: AnyUrl = settings.WACENSUS_DATA_FILE_URL):
    outfile = f"{LEGACY_DATA_DIRECTORY}/wacensus.zip"
    log = logger.add(f"{LEGACY_DATA_DIRECTORY}/import.log", retention="1 day")
    download_data_file(url, outfile)
    extract_data_file(LEGACY_DATA_DIRECTORY, outfile)

    db = SessionLocal()
    admin_id = get_admin_id(db)
    logger.info("Data Import Started")
    import_user = ImportUser(db, admin_id)
    import_user.ingest("HBTUSERS")
    import_user.insert_stub_records()
    ImportAuthor(db, admin_id).ingest("HBTAUTHORS")
    ImportKingdom(db, admin_id).ingest("HBTKINGDOMS")
    ImportPublication(db, admin_id).ingest("HBTPUBLICATIONS")
    ImportClassificationSystem(db, admin_id).ingest("HBTCLASS_SYSTEMS")
    ImportUserDefaults(db, admin_id).ingest("HBTUSERS")
    ImportTaxonRank(db, admin_id).ingest("HBTRANKS")
    ImportTaxonName(db, admin_id).ingest("HBTNAMES")
    ImportTaxonNameFamilyNid(db, admin_id).ingest("HBTNAMES")
    ImportCitation(db, admin_id).ingest("HBTCITATIONS")
    ImportVernacular(db, admin_id).ingest("HBTVERNACULARS")
    ImportCrossReference(db, admin_id).ingest("HBTXREFS")
    ImportHierarchy(db, admin_id).ingest("HBTPARENTS")
    ImportInformalGroup(db, admin_id).ingest("HBTGROUPS")
    trigger_calculated_fields(db)
    logger.info("Import completed")
    logger.remove(log)


def download_data_file(url, outfile):
    logger.info(f"Downloading data file from {url} to {outfile}")
    response = requests.get(url)
    open(outfile, "wb").write(response.content)


def extract_data_file(outdir, outfile):
    with ZipFile(outfile, "r") as zip:
        for file in zip.namelist():
            if file.endswith(settings.WACENSUS_SUFFIX):
                filename = os.path.basename(file)
                source = zip.open(file)
                target = open(os.path.join(outdir, filename), "wb")
                with source, target:
                    logger.debug(f"Extracting {filename} to {outdir}")
                    shutil.copyfileobj(source, target)
