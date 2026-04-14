from app.db.taxon_name_parent.model import TaxonNameParent
from app.tools.backfill_taxon_name_parents import BackfillStats, run_backfill


def test_backfill_taxon_name_parents_creates_unique_exact_match(
    test_db,
    test_taxon_name,
    test_taxon_name_2,
):
    test_taxon_name.uninomial = "Shareduninomial"
    test_taxon_name_2.uninomial = "Shareduninomial"
    test_db.add(test_taxon_name)
    test_db.add(test_taxon_name_2)
    test_db.commit()

    stats = BackfillStats()
    run_backfill(
        db=test_db,
        stats=stats,
        limit=None,
        offset=0,
        skip_populated=True,
        dry_run=False,
    )

    parent_rows = (
        test_db.query(TaxonNameParent).filter(TaxonNameParent.deleted.is_(False)).all()
    )
    assert len(parent_rows) == 2
    assert stats.created == 2


def test_backfill_taxon_name_parents_skip_populated(
    test_db,
    test_taxon_name_parent,
):
    stats = BackfillStats()
    run_backfill(
        db=test_db,
        stats=stats,
        limit=None,
        offset=0,
        skip_populated=True,
        dry_run=False,
    )

    parent_rows = (
        test_db.query(TaxonNameParent).filter(TaxonNameParent.deleted.is_(False)).all()
    )
    assert len(parent_rows) == 1
    assert stats.skipped_populated >= 1
