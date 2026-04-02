#!/usr/bin/env python3
from __future__ import annotations

import argparse
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import and_, func
from sqlalchemy.orm import Session, aliased

import app.model  # noqa: F401
from app.db.session import get_db
from app.db.taxon_name.model import TaxonName
from app.db.taxon_name_parent.model import TaxonNameParent
from app.db.taxon_name_parent_review.model import TaxonNameParentReview


@dataclass
class BackfillStats:
    processed: int = 0
    created: int = 0
    skipped_populated: int = 0
    skipped_blank: int = 0
    skipped_self_only: int = 0
    skipped_ambiguous: int = 0
    failed: int = 0


def backfill_taxon_name_parents(
    limit: Optional[int] = None,
    offset: int = 0,
    skip_populated: bool = False,
    dry_run: bool = True,
    commit_every: int = 100,
):
    db: Session = get_db().__next__()
    stats = BackfillStats()

    print(
        f"Mode: {'DRY RUN' if dry_run else 'WRITE'} | "
        f"skip_populated={skip_populated} | "
        f"offset={offset} | "
        f"limit={limit if limit is not None else 'all'} | "
        f"commit_every={commit_every}"
    )

    try:
        run_backfill(
            db=db,
            stats=stats,
            limit=limit,
            offset=offset,
            skip_populated=skip_populated,
            dry_run=dry_run,
            commit_every=commit_every,
        )
    finally:
        db.close()

    print("")
    print("Backfill summary")
    print(f"Processed: {stats.processed}")
    print(f"Created parent rows: {stats.created}")
    print(f"Skipped populated names: {stats.skipped_populated}")
    print(f"Skipped blank uninomial: {stats.skipped_blank}")
    print(f"Skipped self-only matches: {stats.skipped_self_only}")
    print(f"Skipped ambiguous matches: {stats.skipped_ambiguous}")
    print(f"Failed rows: {stats.failed}")


def run_backfill(
    *,
    db: Session,
    stats: BackfillStats,
    limit: Optional[int],
    offset: int,
    skip_populated: bool,
    dry_run: bool,
    commit_every: int,
):
    query = (
        db.query(TaxonName)
        .filter(TaxonName.deleted.is_(False))
        .order_by(TaxonName.taxon_name_id.asc())
        .offset(offset)
    )

    if limit is not None:
        query = query.limit(limit)

    since_commit = 0

    for taxon_name in query.all():
        stats.processed += 1

        try:
            active_parent_rows = get_active_parent_rows(db, taxon_name.taxon_name_id)
            if active_parent_rows:
                refresh_review_row_from_existing_parents(
                    db=db,
                    taxon_name=taxon_name,
                    active_parent_rows=active_parent_rows,
                )
                if skip_populated:
                    stats.skipped_populated += 1
                continue

            uninomial = (taxon_name.uninomial or "").strip()
            if not uninomial:
                stats.skipped_blank += 1
                upsert_review_row(
                    db=db,
                    taxon_name=taxon_name,
                    status="unmatched",
                    reason="blank_uninomial",
                    candidate_parent_ids=[],
                    candidate_parent_names=[],
                    derived_uninomial=None,
                )
                continue

            matches = find_candidate_parents(db, taxon_name.taxon_name_id, uninomial)

            if not matches:
                stats.skipped_self_only += 1
                upsert_review_row(
                    db=db,
                    taxon_name=taxon_name,
                    status="unmatched",
                    reason="no_candidate_parent",
                    candidate_parent_ids=[],
                    candidate_parent_names=[],
                    derived_uninomial=None,
                )
                continue

            if len(matches) > 1:
                stats.skipped_ambiguous += 1
                upsert_review_row(
                    db=db,
                    taxon_name=taxon_name,
                    status="ambiguous",
                    reason="multiple_candidate_parents",
                    candidate_parent_ids=[match.taxon_name_id for match in matches],
                    candidate_parent_names=[match.uninomial or "" for match in matches],
                    derived_uninomial=None,
                )
                continue

            parent = matches[0]
            stats.created += 1
            action_label = "Would create" if dry_run else "Creating"
            print(
                f"{action_label} parent row: "
                f"taxon_name_id={taxon_name.taxon_name_id} "
                f"parent_taxon_name_id={parent.taxon_name_id} "
                f"sequence=1"
            )

            if dry_run:
                upsert_review_row(
                    db=db,
                    taxon_name=taxon_name,
                    status="matched_needs_review",
                    reason="auto_matched_unique_uninomial",
                    candidate_parent_ids=[parent.taxon_name_id],
                    candidate_parent_names=[parent.uninomial or ""],
                    derived_uninomial=parent.uninomial,
                )
                continue

            db.add(
                TaxonNameParent(
                    taxon_name_id=taxon_name.taxon_name_id,
                    parent_taxon_name_id=parent.taxon_name_id,
                    sequence=1,
                    created_by=taxon_name.created_by,
                    updated_by=taxon_name.updated_by,
                )
            )
            db.flush()
            refresh_review_row_from_existing_parents(
                db=db,
                taxon_name=taxon_name,
                active_parent_rows=get_active_parent_rows(db, taxon_name.taxon_name_id),
                fallback_reason="auto_matched_unique_uninomial",
            )
            since_commit += 1

            if commit_every > 0 and since_commit >= commit_every:
                db.commit()
                print(f"Committed batch of {since_commit} created rows.")
                since_commit = 0
        except Exception as error:
            stats.failed += 1
            db.rollback()
            print(
                "Failed row: "
                f"taxon_name_id={taxon_name.taxon_name_id} "
                f"reason={error}"
            )

    if dry_run:
        db.rollback()
    else:
        if since_commit > 0:
            print(f"Committed final batch of {since_commit} created rows.")
        db.commit()


def has_active_parent_rows(db: Session, taxon_name_id: int) -> bool:
    return bool(get_active_parent_rows(db, taxon_name_id))


def get_active_parent_rows(db: Session, taxon_name_id: int) -> list[TaxonNameParent]:
    return (
        db.query(TaxonNameParent)
        .filter(
            TaxonNameParent.deleted.is_(False),
            TaxonNameParent.taxon_name_id == taxon_name_id,
        )
        .order_by(
            TaxonNameParent.sequence.asc(),
            TaxonNameParent.parent_taxon_name_id.asc(),
        )
        .all()
    )


def find_candidate_parents(db: Session, taxon_name_id: int, uninomial: str) -> list[TaxonName]:
    sibling = aliased(TaxonName)
    exact_match = func.lower(func.trim(sibling.uninomial)) == uninomial.lower()

    return (
        db.query(sibling)
        .filter(
            and_(
                sibling.deleted.is_(False),
                sibling.taxon_name_id != taxon_name_id,
                sibling.uninomial.isnot(None),
                exact_match,
            )
        )
        .order_by(sibling.taxon_name_id.asc())
        .all()
    )


def refresh_review_row_from_existing_parents(
    *,
    db: Session,
    taxon_name: TaxonName,
    active_parent_rows: list[TaxonNameParent],
    fallback_reason: str | None = None,
):
    candidate_parents = get_parent_taxon_names(db, active_parent_rows)
    candidate_parent_ids = [parent.taxon_name_id for parent in candidate_parents]
    candidate_parent_names = [parent.uninomial or "" for parent in candidate_parents]
    derived_uninomial = derive_uninomial_from_parents(taxon_name, candidate_parents)
    status, reason = classify_existing_parent_state(
        taxon_name=taxon_name,
        parent_count=len(candidate_parents),
        derived_uninomial=derived_uninomial,
        fallback_reason=fallback_reason,
    )

    upsert_review_row(
        db=db,
        taxon_name=taxon_name,
        status=status,
        reason=reason,
        candidate_parent_ids=candidate_parent_ids,
        candidate_parent_names=candidate_parent_names,
        derived_uninomial=derived_uninomial,
    )


def get_parent_taxon_names(
    db: Session,
    active_parent_rows: list[TaxonNameParent],
) -> list[TaxonName]:
    if not active_parent_rows:
        return []

    parent_ids = [row.parent_taxon_name_id for row in active_parent_rows]
    parent_map = {
        row.taxon_name_id: row
        for row in db.query(TaxonName)
        .filter(
            TaxonName.deleted.is_(False),
            TaxonName.taxon_name_id.in_(parent_ids),
        )
        .all()
    }

    ordered_parents: list[TaxonName] = []
    for row in active_parent_rows:
        parent = parent_map.get(row.parent_taxon_name_id)
        if parent:
            ordered_parents.append(parent)
    return ordered_parents


def derive_uninomial_from_parents(
    taxon_name: TaxonName,
    parent_taxon_names: list[TaxonName],
) -> str | None:
    parent_uninomials = [
        (parent.uninomial or "").strip()
        for parent in parent_taxon_names
        if (parent.uninomial or "").strip()
    ]
    if not parent_uninomials:
        return None

    hybrid_category = getattr(taxon_name, "hybrid_category", None)
    hybrid_value = hybrid_category.value if hybrid_category else None
    separator = " - " if hybrid_value == "intergrade" else " × "
    return separator.join(parent_uninomials)


def classify_existing_parent_state(
    *,
    taxon_name: TaxonName,
    parent_count: int,
    derived_uninomial: str | None,
    fallback_reason: str | None,
) -> tuple[str, str]:
    hybrid_category = getattr(taxon_name, "hybrid_category", None)
    hybrid_value = hybrid_category.value if hybrid_category else None
    legacy_uninomial = (taxon_name.uninomial or "").strip()
    derived_value = (derived_uninomial or "").strip()

    if parent_count >= 2 and not hybrid_value:
        return "matched_needs_review", "missing_hybrid_category"

    if legacy_uninomial and derived_value and legacy_uninomial != derived_value:
        return "mismatch", "derived_name_mismatch"

    if fallback_reason:
        return "matched_needs_review", fallback_reason

    return "matched_needs_review", "existing_parent_links"


def upsert_review_row(
    *,
    db: Session,
    taxon_name: TaxonName,
    status: str,
    reason: str | None,
    candidate_parent_ids: list[int],
    candidate_parent_names: list[str],
    derived_uninomial: str | None,
):
    review_row = (
        db.query(TaxonNameParentReview)
        .filter(
            TaxonNameParentReview.deleted.is_(False),
            TaxonNameParentReview.taxon_name_id == taxon_name.taxon_name_id,
        )
        .first()
    )

    payload = {
        "status": status,
        "reason": reason,
        "legacy_uninomial": taxon_name.uninomial,
        "derived_uninomial": derived_uninomial,
        "candidate_parent_ids": ",".join(str(value) for value in candidate_parent_ids) or None,
        "candidate_parent_names": " | ".join(name for name in candidate_parent_names if name) or None,
        "parent_count": active_parent_count(db, taxon_name.taxon_name_id),
        "hybrid_category": taxon_name.hybrid_category.value if getattr(taxon_name, "hybrid_category", None) else None,
    }

    if review_row:
        for key, value in payload.items():
            setattr(review_row, key, value)
        review_row.updated_by = taxon_name.updated_by
        db.flush()
        return review_row

    review_row = TaxonNameParentReview(
        taxon_name_id=taxon_name.taxon_name_id,
        created_by=taxon_name.created_by,
        updated_by=taxon_name.updated_by,
        **payload,
    )
    db.add(review_row)
    db.flush()
    return review_row


def active_parent_count(db: Session, taxon_name_id: int) -> int:
    return (
        db.query(func.count(TaxonNameParent.taxon_name_parent_id))
        .filter(
            TaxonNameParent.deleted.is_(False),
            TaxonNameParent.taxon_name_id == taxon_name_id,
        )
        .scalar()
        or 0
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Backfill taxon_name_parents from exact unique uninomial matches."
    )
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of taxon names to inspect.")
    parser.add_argument("--offset", type=int, default=0, help="Offset into the ordered taxon name list.")
    parser.add_argument(
        "--skip-populated",
        action="store_true",
        help="Skip creating parent rows for taxon names that already have active parent rows.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without inserting parent rows.",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Insert parent rows into the database.",
    )
    parser.add_argument(
        "--commit-every",
        type=int,
        default=100,
        help="Commit every N created parent rows during write mode.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    backfill_taxon_name_parents(
        limit=args.limit,
        offset=args.offset,
        skip_populated=args.skip_populated,
        dry_run=not args.write or args.dry_run,
        commit_every=args.commit_every,
    )
