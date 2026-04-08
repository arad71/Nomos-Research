#!/usr/bin/env python3
from __future__ import annotations

import argparse

import app.model  # noqa: F401
from app.db.session import get_db
from app.db.taxon_name import calculated
from app.db.taxon_name.enums import HybridCategory
from app.db.taxon_name.model import TaxonName
from app.db.taxon_name.crud import TaxonNameCrud


def normalize_hybrid_formula_prefixes(
    *,
    dry_run: bool,
    commit_every: int,
    log_every: int,
) -> None:
    db = get_db().__next__()
    try:
        query = (
            db.query(TaxonName)
            .filter(TaxonName.deleted == False)  # noqa: E712
            .order_by(TaxonName.taxon_name_id.asc())
        )

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

        for taxon_name in query.yield_per(1000):
            processed += 1
            old_uninomial = taxon_name.uninomial
            old_parallel_uninomial = taxon_name.parallel_override_uninomial
            old_is_hybrid = taxon_name.is_hybrid
            old_hybrid_category = getattr(taxon_name.hybrid_category, "value", None)

            is_semantic_hybrid_formula = (
                old_is_hybrid
                and old_hybrid_category == HybridCategory.hybrid_formula.value
            )
            has_hybrid_prefix = any(
                [
                    TaxonNameCrud._has_hybrid_formula_prefix(old_uninomial),
                    TaxonNameCrud._has_hybrid_formula_prefix(old_parallel_uninomial),
                ]
            )
            needs_hybrid_formula_sync = (
                is_semantic_hybrid_formula
                and (
                    has_hybrid_prefix
                    or old_parallel_uninomial is None
                )
            )
            if not is_semantic_hybrid_formula and not has_hybrid_prefix and not needs_hybrid_formula_sync:
                if log_every > 0 and processed % log_every == 0:
                    print(
                        f"Progress: processed={processed} matched={matched} updated={updated}"
                    )
                continue

            TaxonNameCrud._normalize_hybrid_formula_fields(taxon_name)

            changed = any(
                [
                    taxon_name.uninomial != old_uninomial,
                    taxon_name.parallel_override_uninomial != old_parallel_uninomial,
                    taxon_name.is_hybrid != old_is_hybrid,
                    getattr(taxon_name.hybrid_category, "value", None) != old_hybrid_category,
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
                    f"uninomial={old_uninomial!r}->{taxon_name.uninomial!r} "
                    f"parallel={old_parallel_uninomial!r}->{taxon_name.parallel_override_uninomial!r} "
                    f"is_hybrid={old_is_hybrid!r}->{taxon_name.is_hybrid!r} "
                    f"hybrid_category={old_hybrid_category!r}->{getattr(taxon_name.hybrid_category, 'value', None)!r}"
                )

            if not dry_run:
                if taxon_name.hybrid_category is None:
                    taxon_name.hybrid_category = HybridCategory.hybrid_formula
                taxon_name.is_hybrid = True
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

        if not dry_run and since_commit > 0:
            db.commit()

        if dry_run:
            db.rollback()

        print("")
        print("Hybrid formula prefix normalization summary")
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
        description="Normalize taxon names starting with X/x to multiplication-sign hybrid formulas."
    )
    parser.add_argument("--write", action="store_true", help="Persist changes.")
    parser.add_argument("--dry-run", action="store_true", help="Force dry-run mode.")
    parser.add_argument("--commit-every", type=int, default=100)
    parser.add_argument("--log-every", type=int, default=1000)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    normalize_hybrid_formula_prefixes(
        dry_run=not args.write or args.dry_run,
        commit_every=args.commit_every,
        log_every=args.log_every,
    )
