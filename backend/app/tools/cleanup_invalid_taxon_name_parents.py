#!/usr/bin/env python3
from __future__ import annotations

import argparse
from collections import Counter

import app.model  # noqa: F401
from app.db.session import get_db
from app.db.taxon_name.model import TaxonName
from app.db.taxon_name_parent.model import TaxonNameParent
from sqlalchemy.orm import joinedload


SPECIES_RANK_NAME = "species"
INFRASPECIFIC_RANK_NAMES = {
    "subspecies",
    "variety",
    "subvariety",
    "form",
    "subform",
}
HIGHER_RANK_INFRAGENERIC_NAMES = {
    "subgenus",
    "section",
    "subsection",
    "series",
    "subseries",
}
ALLOWED_PARENT_RANKS_BY_CHILD_RANK = {
    SPECIES_RANK_NAME: {"genus", "subgenus"},
    "subspecies": {"genus", "species", "subgenus"},
    "variety": {"genus", "species", "subgenus"},
    "subvariety": {"genus", "species", "subgenus"},
    "form": {"genus", "species", "subgenus"},
    "subform": {"genus", "species", "subgenus"},
    "subgenus": {"genus"},
    "section": {"genus"},
    "subsection": {"genus"},
    "series": {"genus"},
    "subseries": {"genus"},
}


def get_rank_name(taxon_name: TaxonName | None) -> str:
    if not taxon_name:
        return ""
    return (
        (getattr(taxon_name, "rank_name", None) or getattr(getattr(taxon_name, "taxon_rank", None), "rank_name", None))
        or ""
    ).strip().lower()


def parent_rank_allowed_for_cleanup(*, child_rank_name: str, parent_rank_name: str) -> bool:
    allowed_parent_ranks = ALLOWED_PARENT_RANKS_BY_CHILD_RANK.get(child_rank_name)
    if allowed_parent_ranks is None:
        return False
    return parent_rank_name in allowed_parent_ranks


def cleanup_invalid_taxon_name_parents(
    *,
    dry_run: bool,
    commit_every: int,
    log_every: int,
    taxon_name_ids: set[int] | None,
) -> None:
    db = get_db().__next__()
    try:
        base_query = (
            db.query(TaxonNameParent.taxon_name_parent_id)
            .filter(TaxonNameParent.deleted == False)  # noqa: E712
            .order_by(TaxonNameParent.taxon_name_parent_id.asc())
        )
        if taxon_name_ids:
            base_query = base_query.filter(TaxonNameParent.taxon_name_id.in_(taxon_name_ids))

        processed = 0
        invalid_count = 0
        deleted_count = 0
        pattern_counts: Counter[tuple[str, str]] = Counter()
        samples: list[str] = []
        since_commit = 0

        print(
            f"Mode: {'DRY RUN' if dry_run else 'WRITE'} | "
            f"commit_every={commit_every} | "
            f"log_every={log_every} | "
            f"taxon_name_ids={'all' if not taxon_name_ids else ','.join(str(i) for i in sorted(taxon_name_ids))}"
        )

        batch_size = 1000
        last_seen_id = 0
        while True:
            batch_ids = [
                row[0]
                for row in base_query
                .filter(TaxonNameParent.taxon_name_parent_id > last_seen_id)
                .limit(batch_size)
                .all()
            ]
            if not batch_ids:
                break

            rows = (
                db.query(TaxonNameParent)
                .options(
                    joinedload(TaxonNameParent.taxon_name).joinedload(TaxonName.taxon_rank),
                    joinedload(TaxonNameParent.parent_taxon_name).joinedload(TaxonName.taxon_rank),
                )
                .filter(TaxonNameParent.taxon_name_parent_id.in_(batch_ids))
                .order_by(TaxonNameParent.taxon_name_parent_id.asc())
                .all()
            )

            for row in rows:
                processed += 1
                child_rank_name = get_rank_name(row.taxon_name)
                parent_rank_name = get_rank_name(row.parent_taxon_name)
                if parent_rank_allowed_for_cleanup(
                    child_rank_name=child_rank_name,
                    parent_rank_name=parent_rank_name,
                ):
                    if log_every > 0 and processed % log_every == 0:
                        print(
                            f"Progress: processed={processed} invalid={invalid_count} deleted={deleted_count}"
                        )
                    continue

                invalid_count += 1
                pattern_counts[(child_rank_name, parent_rank_name)] += 1

                if len(samples) < 20:
                    samples.append(
                        f"row={row.taxon_name_parent_id} child={row.taxon_name_id}:{child_rank_name} "
                        f"parent={row.parent_taxon_name_id}:{parent_rank_name}"
                    )

                if not dry_run:
                    row.deleted = True
                    row.updated_by = row.updated_by or row.created_by
                    deleted_count += 1
                    since_commit += 1
                    if commit_every > 0 and since_commit >= commit_every:
                        db.commit()
                        since_commit = 0

                if log_every > 0 and processed % log_every == 0:
                    print(
                        f"Progress: processed={processed} invalid={invalid_count} deleted={deleted_count}"
                    )
            last_seen_id = batch_ids[-1]

        if not dry_run and since_commit > 0:
            db.commit()

        if dry_run:
            db.rollback()

        print("")
        print("Invalid parent cleanup summary")
        print(f"Processed rows: {processed}")
        print(f"Invalid rows found: {invalid_count}")
        print(f"Rows deleted: {deleted_count}")
        print("")
        print("Top invalid patterns")
        for (child_rank_name, parent_rank_name), count in pattern_counts.most_common(20):
            print(f"- {child_rank_name} -> {parent_rank_name}: {count}")

        if samples:
            print("")
            print("Sample invalid rows")
            for sample in samples:
                print(f"- {sample}")
    finally:
        db.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Soft-delete invalid taxon_name_parent rows based on child/parent rank rules."
    )
    parser.add_argument("--write", action="store_true", help="Persist changes.")
    parser.add_argument("--dry-run", action="store_true", help="Force dry-run mode.")
    parser.add_argument("--commit-every", type=int, default=100)
    parser.add_argument("--log-every", type=int, default=1000)
    parser.add_argument(
        "--taxon-name-ids",
        type=str,
        default="",
        help="Optional comma-separated child taxon_name_ids to limit cleanup scope.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    taxon_name_ids = {
        int(value.strip())
        for value in args.taxon_name_ids.split(",")
        if value.strip()
    } or None
    cleanup_invalid_taxon_name_parents(
        dry_run=not args.write or args.dry_run,
        commit_every=args.commit_every,
        log_every=args.log_every,
        taxon_name_ids=taxon_name_ids,
    )
