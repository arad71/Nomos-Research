#!/usr/bin/env python3
from __future__ import annotations

import argparse

import app.model  # noqa: F401
from app.db.session import get_db
from app.db.taxon_name import calculated
from app.db.taxon_name.crud import TaxonNameCrud
from app.db.taxon_name.enums import HybridCategory
from app.db.taxon_name.model import TaxonName


def normalize_named_hybrid_specific_epithets(
    *,
    dry_run: bool,
    commit_every: int,
    log_every: int,
) -> None:
    db = get_db().__next__()
    try:
        processed = 0
        matched = 0
        updated = 0
        since_commit = 0
        samples: list[str] = []

        print(
            f"Mode: {'DRY RUN' if dry_run else 'WRITE'} | "
            f"commit_every={commit_every} | "
            f"log_every={log_every}"
        )

        base_query = (
            db.query(TaxonName.taxon_name_id)
            .filter(TaxonName.deleted == False)  # noqa: E712
            .order_by(TaxonName.taxon_name_id.asc())
        )

        batch_size = 1000
        last_seen_id = 0
        while True:
            batch_ids = [
                row[0]
                for row in (
                    base_query.filter(TaxonName.taxon_name_id > last_seen_id)
                    .limit(batch_size)
                    .all()
                )
            ]
            if not batch_ids:
                break

            rows = (
                db.query(TaxonName)
                .filter(TaxonName.taxon_name_id.in_(batch_ids))
                .order_by(TaxonName.taxon_name_id.asc())
                .all()
            )

            for taxon_name in rows:
                processed += 1

                rank_name = (
                    ((taxon_name.rank_name or taxon_name.taxon_rank.rank_name) or "")
                    .strip()
                    .lower()
                )
                old_specific_epithet = taxon_name.specific_epithet
                old_parallel_specific_epithet = (
                    taxon_name.parallel_override_specific_epithet
                )
                old_is_hybrid = taxon_name.is_hybrid
                old_hybrid_category = getattr(taxon_name.hybrid_category, "value", None)
                normalized_parallel_specific_epithet = (
                    TaxonNameCrud._normalize_hybrid_formula_prefix(
                        old_parallel_specific_epithet
                    )
                )
                normalized_specific_epithet = (
                    TaxonNameCrud._normalize_hybrid_formula_prefix(old_specific_epithet)
                )

                has_named_hybrid_specific_prefix = (
                    rank_name == "species"
                    and bool(taxon_name.uninomial)
                    and TaxonNameCrud._has_hybrid_formula_prefix(old_specific_epithet)
                )
                has_named_hybrid_parallel_prefix = (
                    rank_name == "species"
                    and bool(taxon_name.uninomial)
                    and TaxonNameCrud._has_hybrid_formula_prefix(
                        old_parallel_specific_epithet
                    )
                )
                needs_named_hybrid_sync = (
                    rank_name == "species"
                    and bool(taxon_name.uninomial)
                    and old_is_hybrid
                    and old_hybrid_category == HybridCategory.named_hybrid.value
                    and (
                        has_named_hybrid_specific_prefix
                        or has_named_hybrid_parallel_prefix
                    )
                )

                if not (
                    has_named_hybrid_specific_prefix
                    or has_named_hybrid_parallel_prefix
                    or needs_named_hybrid_sync
                ):
                    if log_every > 0 and processed % log_every == 0:
                        print(
                            f"Progress: processed={processed} matched={matched} updated={updated}"
                        )
                    continue

                taxon_name.is_hybrid = True
                taxon_name.hybrid_category = HybridCategory.named_hybrid
                if (
                    old_parallel_specific_epithet is None
                    and normalized_specific_epithet
                ):
                    taxon_name.parallel_override_specific_epithet = (
                        normalized_specific_epithet
                    )
                elif normalized_parallel_specific_epithet:
                    taxon_name.parallel_override_specific_epithet = (
                        normalized_parallel_specific_epithet
                    )

                changed = any(
                    [
                        taxon_name.is_hybrid != old_is_hybrid,
                        getattr(taxon_name.hybrid_category, "value", None)
                        != old_hybrid_category,
                        taxon_name.parallel_override_specific_epithet
                        != old_parallel_specific_epithet,
                    ]
                )
                if not changed:
                    if log_every > 0 and processed % log_every == 0:
                        print(
                            f"Progress: processed={processed} matched={matched} updated={updated}"
                        )
                    continue

                matched += 1
                calculated.calculate_name_fields(taxon_name)

                if len(samples) < 20:
                    samples.append(
                        f"id={taxon_name.taxon_name_id} "
                        f"specific={old_specific_epithet!r} "
                        f"parallel_specific={old_parallel_specific_epithet!r}->{taxon_name.parallel_override_specific_epithet!r} "
                        f"is_hybrid={old_is_hybrid!r}->{taxon_name.is_hybrid!r} "
                        f"hybrid_category={old_hybrid_category!r}->{getattr(taxon_name.hybrid_category, 'value', None)!r}"
                    )

                if not dry_run:
                    db.add(taxon_name)
                    updated += 1
                    since_commit += 1
                    if commit_every > 0 and since_commit >= commit_every:
                        db.commit()
                        since_commit = 0

                if log_every > 0 and processed % log_every == 0:
                    print(
                        f"Progress: processed={processed} matched={matched} updated={updated}"
                    )
            last_seen_id = batch_ids[-1]

        if not dry_run and since_commit > 0:
            db.commit()

        if dry_run:
            db.rollback()

        print("")
        print("Named hybrid specific-epithet normalization summary")
        print(f"Processed rows: {processed}")
        print(f"Matched rows: {matched}")
        print(f"Updated rows: {updated}")
        if samples:
            print("")
            print("Sample changes")
            for sample in samples:
                print(f"- {sample}")
    finally:
        db.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Identify species specific epithets starting with X/x/× and mark them as named hybrids without altering the stored epithet."
        )
    )
    parser.add_argument("--write", action="store_true", help="Persist changes.")
    parser.add_argument("--dry-run", action="store_true", help="Force dry-run mode.")
    parser.add_argument("--commit-every", type=int, default=100)
    parser.add_argument("--log-every", type=int, default=1000)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    normalize_named_hybrid_specific_epithets(
        dry_run=not args.write or args.dry_run,
        commit_every=args.commit_every,
        log_every=args.log_every,
    )
