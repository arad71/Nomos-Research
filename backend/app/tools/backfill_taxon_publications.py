#!/usr/bin/env python3
"""Backfill taxon-publication links from legacy taxon_name.publication_id values.

The legacy taxon_name.publication_id column links a taxon name to a single
publication. The taxon_publication table is the newer publication-reference
model. This script creates missing taxon_publication rows for legacy links and
skips links that already exist, so it is safe to rerun.
"""

import argparse

from loguru import logger
from sqlalchemy.orm import Session

import app.model  # noqa: F401 - register all models
from app.db.citation.calculated import trigger_taxon_name_calculated_fields
from app.db.session import get_db
from app.db.taxon_name.model import TaxonName
from app.db.taxon_publication.model import TaxonPublication


def backfill_taxon_publications(
    *,
    dry_run: bool,
    limit: int | None,
    batch_size: int,
    user_id: int | None,
    include_deleted_taxon_names: bool,
    recalculate: bool,
) -> None:
    """Create missing taxon_publication rows from taxon_name.publication_id."""

    if batch_size < 1:
        raise ValueError("batch_size must be at least 1")

    db: Session = next(get_db())

    logger.info("Starting taxon publication backfill")
    logger.info(
        "dry_run={} limit={} batch_size={} user_id={} "
        "include_deleted_taxon_names={} recalculate={}",
        dry_run,
        limit,
        batch_size,
        user_id,
        include_deleted_taxon_names,
        recalculate,
    )

    query = (
        db.query(TaxonName)
        .filter(TaxonName.publication_id.isnot(None))
        .order_by(TaxonName.taxon_name_id.asc())
    )

    if not include_deleted_taxon_names:
        query = query.filter(TaxonName.deleted == False)  # noqa: E712

    if limit:
        query = query.limit(limit)

    total = query.count()
    logger.info("Found {} taxon names with legacy publication links", total)

    created = skipped = errors = 0

    for index, taxon_name in enumerate(query.yield_per(batch_size), start=1):
        taxon_name_id = taxon_name.taxon_name_id
        publication_id = taxon_name.publication_id

        try:
            existing_link = (
                db.query(TaxonPublication.taxon_publication_id)
                .filter(
                    TaxonPublication.taxon_name_id == taxon_name_id,
                    TaxonPublication.publication_id == publication_id,
                    TaxonPublication.deleted == False,  # noqa: E712
                )
                .first()
            )

            if existing_link:
                skipped += 1
                continue

            if dry_run:
                logger.info(
                    "[DRY RUN] create taxon_publication "
                    "taxon_name_id={} publication_id={}",
                    taxon_name_id,
                    publication_id,
                )
            else:
                link = TaxonPublication(
                    taxon_name_id=taxon_name_id,
                    publication_id=publication_id,
                )
                if user_id is not None:
                    link.created_by = user_id
                    link.updated_by = user_id

                db.add(link)

                if recalculate:
                    trigger_taxon_name_calculated_fields(db, taxon_name_id)

            created += 1

            if not dry_run and created % batch_size == 0:
                db.flush()
                logger.info("Flushed {} created links ({} inspected)", created, index)

        except Exception:
            errors += 1
            logger.exception(
                "Error processing taxon_name_id={} publication_id={}",
                taxon_name_id,
                publication_id,
            )

    if not dry_run and created > 0:
        db.commit()
        logger.info("Final commit complete")

    prefix = "[DRY RUN] " if dry_run else ""
    logger.info(
        "{}Backfill complete: {} created, {} skipped, {} errors, {} inspected",
        prefix,
        created,
        skipped,
        errors,
        total,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=(
            "Create missing taxon_publication rows from legacy "
            "taxon_name.publication_id values."
        )
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Persist changes. Without this flag the script runs in dry-run mode.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Force dry-run mode.")
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of taxon names to inspect.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=1000,
        help="Flush every N created links.",
    )
    parser.add_argument(
        "--user-id",
        type=int,
        default=None,
        help="Optional user_id to store in created_by and updated_by.",
    )
    parser.add_argument(
        "--include-deleted-taxon-names",
        action="store_true",
        help="Include soft-deleted taxon names.",
    )
    parser.add_argument(
        "--no-recalculate",
        action="store_true",
        help="Skip recalculating taxon name derived fields after creating links.",
    )
    args = parser.parse_args()

    backfill_taxon_publications(
        dry_run=not args.write or args.dry_run,
        limit=args.limit,
        batch_size=args.batch_size,
        user_id=args.user_id,
        include_deleted_taxon_names=args.include_deleted_taxon_names,
        recalculate=not args.no_recalculate,
    )
