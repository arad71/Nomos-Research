#!/usr/bin/env python3
import os

from app.db.author.dataimport import ImportAuthor
from app.db.citation.dataimport import ImportCitation
from app.db.classification_system.dataimport import ImportClassificationSystem
from app.db.cross_reference.dataimport import ImportCrossReference
from app.db.hierarchy.dataimport import ImportHierarchy
from app.db.informal_group.dataimport import ImportInformalGroup
from app.db.kingdom.dataimport import ImportKingdom
from app.db.publication.dataimport import ImportPublication
from app.db.session import SessionLocal
from app.db.taxon_name.dataimport import ImportTaxonName, ImportTaxonNameFamilyNid
from app.db.taxon_rank.dataimport import ImportTaxonRank
from app.db.user.crud import UserCrud
from app.db.user.dataimport import ImportUser
from app.db.vernacular.dataimport import ImportVernacular


def get_admin_id():
    admin_email = os.getenv("ADMIN_EMAIL", "admin@taxman.com")
    admin = UserCrud.get_user_by_email(db=db, email=admin_email)
    return admin.user_id


if __name__ == "__main__":
    db = SessionLocal()
    admin_id = get_admin_id()

    print("Data Import")

    import_user = ImportUser(db, admin_id)
    import_user.ingest("HBTUSERS_DATA_TABLE.csv")
    import_user.insert_stub_records()
    ImportAuthor(db, admin_id).ingest("HBTAUTHORS_DATA_TABLE.csv")
    ImportKingdom(db, admin_id).ingest("HBTKINGDOMS_DATA_TABLE.csv")
    ImportPublication(db, admin_id).ingest("HBTPUBLICATIONS_DATA_TABLE.csv")
    ImportClassificationSystem(db, admin_id).ingest("HBTCLASS_SYSTEMS_DATA_TABLE.csv")
    ImportTaxonRank(db, admin_id).ingest("HBTRANKS_DATA_TABLE.csv")
    ImportTaxonName(db, admin_id).ingest("HBTNAMES_DATA_TABLE.csv")
    ImportTaxonNameFamilyNid(db, admin_id).ingest("HBTNAMES_DATA_TABLE.csv")
    ImportCitation(db, admin_id).ingest("HBTCITATIONS_DATA_TABLE.csv")
    ImportVernacular(db, admin_id).ingest("HBTVERNACULARS_DATA_TABLE.csv")
    ImportCrossReference(db, admin_id).ingest("HBTXREFS_DATA_TABLE.csv")
    ImportHierarchy(db, admin_id).ingest("HBTPARENTS_DATA_TABLE.csv")
    ImportInformalGroup(db, admin_id).ingest("HBTGROUPS_DATA_TABLE.csv")
