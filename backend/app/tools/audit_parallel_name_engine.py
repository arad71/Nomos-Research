#!/usr/bin/env python3
from __future__ import annotations

import argparse
from dataclasses import dataclass, field

import app.model  # noqa: F401
from app.db.session import get_db
from app.db.taxon_name import calculated
from app.db.taxon_name.model import TaxonName
from app.db.taxon_name.parallel_name_preview import generate_parallel_name_preview


@dataclass
class MismatchSample:
    taxon_name_id: int
    mismatch_kind: str
    current_scientific_name: str | None
    derived_scientific_name: str | None
    current_canonical_name: str | None
    derived_canonical_name: str | None
    strategy: str


@dataclass
class AuditStats:
    processed: int = 0
    matches_all: int = 0
    scientific_mismatch: int = 0
    author_only_scientific_mismatch: int = 0
    canonical_mismatch: int = 0
    both_mismatch: int = 0
    errors: int = 0
    mismatch_samples: list[MismatchSample] = field(default_factory=list)


def audit_parallel_name_engine(
    *,
    strict: bool,
    current_only: bool,
    offset: int,
    limit: int | None,
    batch_size: int,
    log_every: int,
    sample_size: int,
) -> AuditStats:
    db = get_db().__next__()
    stats = AuditStats()
    try:
        query = (
            db.query(TaxonName.taxon_name_id, TaxonName.author)
            .filter(TaxonName.deleted == False)  # noqa: E712
            .order_by(TaxonName.taxon_name_id.asc())
        )
        if current_only:
            query = query.filter(TaxonName.is_current == True)  # noqa: E712

        current_offset = offset
        remaining = limit

        while True:
            next_limit = batch_size if remaining is None else min(batch_size, remaining)
            if next_limit <= 0:
                break

            taxon_rows = query.offset(current_offset).limit(next_limit).all()
            if not taxon_rows:
                break

            for taxon_name_id, current_author in taxon_rows:
                stats.processed += 1
                try:
                    preview = generate_parallel_name_preview(
                        db=db,
                        taxon_name_id=taxon_name_id,
                        strict=strict,
                    )
                    scientific_match = bool(preview.matches_current_scientific_name)
                    canonical_match = (preview.current_canonical_name or "") == (
                        preview.derived_canonical_name or ""
                    )

                    if scientific_match and canonical_match:
                        stats.matches_all += 1
                    elif scientific_match:
                        stats.canonical_mismatch += 1
                    elif canonical_match:
                        derived_matches_current_author = (
                            calculated.filter_join(
                                [
                                    preview.current_canonical_name,
                                    current_author,
                                ]
                            )
                            == (preview.derived_scientific_name or "")
                        )
                        if derived_matches_current_author:
                            stats.author_only_scientific_mismatch += 1
                        else:
                            stats.scientific_mismatch += 1
                    else:
                        stats.both_mismatch += 1

                    if (
                        len(stats.mismatch_samples) < sample_size
                        and not (scientific_match and canonical_match)
                    ):
                        mismatch_kind = "both"
                        if scientific_match:
                            mismatch_kind = "canonical_only"
                        elif canonical_match:
                            mismatch_kind = (
                                "author_only_scientific"
                                if derived_matches_current_author
                                else "scientific_only"
                            )
                        stats.mismatch_samples.append(
                            MismatchSample(
                                taxon_name_id=taxon_name_id,
                                mismatch_kind=mismatch_kind,
                                current_scientific_name=preview.current_scientific_name,
                                derived_scientific_name=preview.derived_scientific_name,
                                current_canonical_name=preview.current_canonical_name,
                                derived_canonical_name=preview.derived_canonical_name,
                                strategy=preview.strategy,
                            )
                        )
                except Exception:
                    stats.errors += 1

                if log_every > 0 and stats.processed % log_every == 0:
                    print(
                        "Progress: "
                        f"processed={stats.processed} "
                        f"matches_all={stats.matches_all} "
                        f"scientific_mismatch={stats.scientific_mismatch} "
                        f"author_only_scientific_mismatch={stats.author_only_scientific_mismatch} "
                        f"canonical_mismatch={stats.canonical_mismatch} "
                        f"both_mismatch={stats.both_mismatch} "
                        f"errors={stats.errors}"
                    )

            current_offset += len(taxon_rows)
            if remaining is not None:
                remaining -= len(taxon_rows)

        return stats
    finally:
        db.close()


def print_summary(stats: AuditStats, *, strict: bool, current_only: bool) -> None:
    print("")
    print("Parallel name audit summary")
    print(f"Strict mode: {strict}")
    print(f"Current only: {current_only}")
    print(f"Processed: {stats.processed}")
    print(f"All matched: {stats.matches_all}")
    print(f"Scientific mismatch only: {stats.scientific_mismatch}")
    print(f"Author-only scientific mismatch: {stats.author_only_scientific_mismatch}")
    print(f"Canonical mismatch only: {stats.canonical_mismatch}")
    print(f"Scientific and canonical mismatch: {stats.both_mismatch}")
    print(f"Errors: {stats.errors}")

    if stats.mismatch_samples:
        print("")
        print("Mismatch samples")
        for sample in stats.mismatch_samples:
            print(
                f"- Taxon {sample.taxon_name_id} | "
                f"strategy={sample.strategy} | kind={sample.mismatch_kind}"
            )
            print(f"  Current scientific: {sample.current_scientific_name or 'Not set'}")
            print(f"  Derived scientific: {sample.derived_scientific_name or 'Not set'}")
            print(f"  Current canonical: {sample.current_canonical_name or 'Not set'}")
            print(f"  Derived canonical: {sample.derived_canonical_name or 'Not set'}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audit the parallel name engine across taxon names."
    )
    parser.add_argument("--strict", action="store_true", help="Disable legacy infrageneric fallback while auditing.")
    parser.add_argument("--current-only", action="store_true", help="Audit only current taxon names.")
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--batch-size", type=int, default=500)
    parser.add_argument("--log-every", type=int, default=1000)
    parser.add_argument("--sample-size", type=int, default=20)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    stats = audit_parallel_name_engine(
        strict=args.strict,
        current_only=args.current_only,
        offset=args.offset,
        limit=args.limit,
        batch_size=args.batch_size,
        log_every=args.log_every,
        sample_size=args.sample_size,
    )
    print_summary(stats, strict=args.strict, current_only=args.current_only)
