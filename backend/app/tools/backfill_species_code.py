#!/usr/bin/env python3
"""Backfill species_code for existing taxon_name records.

This script can be run independently of alembic migrations.
It applies the WACensus-parity species code formula to all existing
taxon_name records that don't yet have a species_code.
"""

from typing import Optional

import typer
from loguru import logger
from sqlalchemy.orm import Session

import app.model  # noqa: F401 — register all models
from app.db.session import get_db
from app.db.taxon_name.model import TaxonName
from app.db.taxon_name.species_code import generate_species_code
from app.db.taxon_rank.model import TaxonRank

# ✅ Create a Typer app
app = typer.Typer(help="Maintenance tools for taxon_name data")


@app.command("backfill-species-code")
def backfill_species_code(
    dry_run: bool = typer.Option(
        False,
        "--dry-run/--no-dry-run",
        help="Show changes without applying them",
    ),
    limit: Optional[int] = typer.Option(
        None,
        "--limit",
        help="Limit number of records to process",
    ),
    overwrite: bool = typer.Option(
        False,
        "--overwrite/--no-overwrite",
        help="Overwrite existing species_code values",
    ),
    batch_size: int = typer.Option(
        5000,
        "--batch-size",
        help="Commit every N records",
    ),
):
    """Backfill species_code for existing taxon_name records."""
    db: Session = get_db().__next__()

    logger.info("Starting species_code backfill")
    logger.info(f"  dry_run={dry_run}, limit={limit}, overwrite={overwrite}")

    # Query all non-deleted taxon names at species level and below
    query = (
        db.query(TaxonName)
        .join(TaxonRank, TaxonName.rank_id == TaxonRank.taxon_rank_id)
        .filter(TaxonName.deleted == False)  # noqa: E712
        .filter(TaxonRank.uninomial == False)  # noqa: E712
    )

    if not overwrite:
        query = query.filter(
            (TaxonName.species_code == None)  # noqa: E711
            | (TaxonName.species_code == "")
        )

    if limit:
        query = query.limit(limit)

    total = query.count()
    logger.info(f"Found {total} records to process")

    updated = skipped = errors = 0

    for taxon_name in query.yield_per(batch_size):
        try:
            new_code = generate_species_code(taxon_name)

            if not new_code or taxon_name.species_code == new_code:
                skipped += 1
                continue

            if dry_run:
                logger.debug(
                    f"[DRY RUN] {taxon_name.taxon_name_id}: "
                    f"{taxon_name.species_code!r} → {new_code!r} "
                    f"({taxon_name.uninomial} {taxon_name.specific_epithet})"
                )
            else:
                taxon_name.species_code = new_code
                taxon_name.calculate_name = False
                db.add(taxon_name)

            updated += 1

            if not dry_run and updated % batch_size == 0:
                db.commit()
                logger.info(f"Committed batch: {updated}/{total}")

        except Exception as exc:
            errors += 1
            logger.error(
                f"Error processing taxon_name_id={taxon_name.taxon_name_id}: {exc}"
            )

    if not dry_run and updated > 0:
        db.commit()

    prefix = "[DRY RUN] " if dry_run else ""
    logger.info(
        f"{prefix}Backfill complete: "
        f"{updated} updated, {skipped} skipped, {errors} errors "
        f"(of {total} total)"
    )


if __name__ == "__main__":
    app()
