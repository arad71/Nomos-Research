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
        help="Flush every N records (single commit at end)",
    ),
):
    """Backfill species_code for existing taxon_name records."""

    db: Session = next(get_db())

    logger.info("Starting species_code backfill")
    logger.info(f"  dry_run={dry_run}, limit={limit}, overwrite={overwrite}")

    query = (
        db.query(TaxonName)
        .join(TaxonRank, TaxonName.rank_id == TaxonRank.taxon_rank_id)
        .filter(TaxonName.deleted == False)  # noqa: E712
        .filter(TaxonRank.uninomial == False)  # noqa: E712
        .order_by(TaxonName.taxon_name_id.asc())
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

    for i, taxon_name in enumerate(query.yield_per(batch_size), start=1):
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

            updated += 1

            # ✅ flush, NOT commit
            if not dry_run and i % batch_size == 0:
                db.flush()
                logger.info(f"Flushed batch: {i}/{total}")

        except Exception:
            errors += 1
            logger.exception(
                "Error processing taxon_name_id=%s",
                taxon_name.taxon_name_id,
            )

    if not dry_run and updated > 0:
        db.commit()
        logger.info("Final commit complete")

    prefix = "[DRY RUN] " if dry_run else ""
    logger.info(
        f"{prefix}Backfill complete: "
        f"{updated} updated, {skipped} skipped, {errors} errors "
        f"(of {total} total)"
    )


if __name__ == "__main__":
    app()
