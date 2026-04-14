#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import and_, func
from sqlalchemy.orm import Session, aliased

import app.model  # noqa: F401
from app.db.hierarchy.model import Hierarchy
from app.db.session import get_db
from app.db.taxon_name.model import TaxonName
from app.db.taxon_name_parent.model import TaxonNameParent
from app.db.taxon_name_parent_review.model import TaxonNameParentReview
from app.db.taxon_rank.model import TaxonRank

READ_BATCH_SIZE_DEFAULT = 1000
BRACKETED_INFRAGENERIC_RE = re.compile(r"^\S+\s+\(([^)]+)\)\s+\S+")
INFRAGENERIC_PARENT_LINK_RANK_NAMES = {
    "subgenus",
    "section",
    "subsection",
    "series",
    "subseries",
}
ALLOWED_PARENT_RANKS_BY_CHILD_RANK = {
    "species": {"genus", "subgenus"},
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
PARENT_REVIEW_IN_SCOPE_RANK_NAMES = {
    "species",
    "subspecies",
    "variety",
    "subvariety",
    "form",
    "subform",
    "hybrid",
} | INFRAGENERIC_PARENT_LINK_RANK_NAMES


@dataclass
class BackfillStats:
    processed: int = 0
    created: int = 0
    skipped_populated: int = 0
    skipped_reviewed: int = 0
    skipped_blank: int = 0
    skipped_self_only: int = 0
    skipped_ambiguous: int = 0
    failed: int = 0


@dataclass
class BatchContext:
    review_rows_by_taxon_id: dict[int, TaxonNameParentReview] = field(
        default_factory=dict
    )
    active_parent_rows_by_taxon_id: dict[int, list[TaxonNameParent]] = field(
        default_factory=lambda: defaultdict(list)
    )
    active_hierarchies_by_taxon_id: dict[int, list[Hierarchy]] = field(
        default_factory=lambda: defaultdict(list)
    )
    taxon_names_by_id: dict[int, TaxonName] = field(default_factory=dict)
    taxon_ranks_by_id: dict[int, TaxonRank] = field(default_factory=dict)
    candidate_matches_by_taxon_id: dict[int, list[TaxonName]] = field(
        default_factory=dict
    )
    subgenus_matches_by_name: dict[str, list[TaxonName]] = field(default_factory=dict)


def backfill_taxon_name_parents(
    limit: Optional[int] = None,
    offset: int = 0,
    skip_populated: bool = False,
    skip_reviewed: bool = False,
    only_unresolved: bool = False,
    only_status: Optional[list[str]] = None,
    dry_run: bool = True,
    commit_every: int = 100,
    log_every: int = 1000,
    read_batch_size: int = READ_BATCH_SIZE_DEFAULT,
):
    db: Session = get_db().__next__()
    stats = BackfillStats()

    print(
        f"Mode: {'DRY RUN' if dry_run else 'WRITE'} | "
        f"skip_populated={skip_populated} | "
        f"skip_reviewed={skip_reviewed} | "
        f"only_unresolved={only_unresolved} | "
        f"only_status={','.join(only_status) if only_status else 'all'} | "
        f"offset={offset} | "
        f"limit={limit if limit is not None else 'all'} | "
        f"commit_every={commit_every} | "
        f"log_every={log_every} | "
        f"read_batch_size={read_batch_size}"
    )

    try:
        run_backfill(
            db=db,
            stats=stats,
            limit=limit,
            offset=offset,
            skip_populated=skip_populated,
            skip_reviewed=skip_reviewed,
            only_unresolved=only_unresolved,
            only_status=only_status,
            dry_run=dry_run,
            commit_every=commit_every,
            log_every=log_every,
            read_batch_size=read_batch_size,
        )
    finally:
        db.close()

    print("")
    print("Backfill summary")
    print(f"Processed: {stats.processed}")
    print(f"Created parent rows: {stats.created}")
    print(f"Skipped populated names: {stats.skipped_populated}")
    print(f"Skipped reviewed names: {stats.skipped_reviewed}")
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
    skip_reviewed: bool,
    only_unresolved: bool,
    only_status: Optional[list[str]],
    dry_run: bool,
    commit_every: int,
    log_every: int,
    read_batch_size: int,
):
    base_query = (
        db.query(TaxonName)
        .filter(TaxonName.deleted.is_(False))
        .order_by(TaxonName.taxon_name_id.asc())
    )

    if only_unresolved or only_status:
        base_query = base_query.join(
            TaxonNameParentReview,
            and_(
                TaxonNameParentReview.taxon_name_id == TaxonName.taxon_name_id,
                TaxonNameParentReview.deleted.is_(False),
            ),
        )
        if only_unresolved:
            base_query = base_query.filter(
                TaxonNameParentReview.status.notin_(["resolved", "ignored"])
            )
        if only_status:
            base_query = base_query.filter(
                TaxonNameParentReview.status.in_(only_status)
            )

    since_commit = 0
    current_offset = offset
    remaining = limit
    last_seen_taxon_name_id: int | None = None

    while True:
        batch_limit = (
            read_batch_size if remaining is None else min(read_batch_size, remaining)
        )
        if batch_limit <= 0:
            break

        batch_query = base_query
        if last_seen_taxon_name_id is not None:
            batch_query = batch_query.filter(
                TaxonName.taxon_name_id > last_seen_taxon_name_id
            )
        elif current_offset:
            batch_query = batch_query.offset(current_offset)

        batch = batch_query.limit(batch_limit).all()
        if not batch:
            break

        context = build_batch_context(db, batch)

        for taxon_name in batch:
            stats.processed += 1

            try:
                if (
                    skip_reviewed
                    and taxon_name.taxon_name_id in context.review_rows_by_taxon_id
                ):
                    stats.skipped_reviewed += 1
                    log_progress(stats, log_every)
                    continue

                if is_rank_out_of_scope_for_parent_review(context, taxon_name):
                    log_progress(stats, log_every)
                    continue

                active_parent_rows = context.active_parent_rows_by_taxon_id.get(
                    taxon_name.taxon_name_id,
                    [],
                )
                if active_parent_rows:
                    if refresh_review_row_from_existing_parents(
                        db=db,
                        context=context,
                        taxon_name=taxon_name,
                        active_parent_rows=active_parent_rows,
                    ):
                        since_commit = maybe_commit(
                            db=db,
                            dry_run=dry_run,
                            commit_every=commit_every,
                            since_commit=since_commit + 1,
                        )
                    if skip_populated:
                        stats.skipped_populated += 1
                    log_progress(stats, log_every)
                    continue

                hierarchy_direct_parents = (
                    filter_valid_parent_candidates(
                        context=context,
                        taxon_name=taxon_name,
                        matches=find_direct_hierarchy_parent_candidates(
                            context=context,
                            taxon_name=taxon_name,
                        ),
                    )
                    if is_infrageneric_parent_link_rank(context, taxon_name)
                    else []
                )
                if len(hierarchy_direct_parents) == 1:
                    parent = hierarchy_direct_parents[0]
                    stats.created += 1

                    if dry_run:
                        status, reason = classify_candidate_match_state(
                            context=context,
                            taxon_name=taxon_name,
                            derived_uninomial=parent.uninomial,
                            fallback_reason="auto_matched_infrageneric_hierarchy_parent",
                            hierarchy_confirmed=True,
                            infrageneric_confirmed=True,
                        )
                        if upsert_review_row(
                            db=db,
                            context=context,
                            taxon_name=taxon_name,
                            status=status,
                            reason=reason,
                            candidate_parent_ids=[parent.taxon_name_id],
                            candidate_parent_names=[
                                parent.uninomial or parent.scientific_name or ""
                            ],
                            derived_uninomial=parent.uninomial,
                            hierarchy_confirmed=True,
                            hierarchy_confirmation_note="Matched direct hierarchy parent for infrageneric rank",
                            has_hierarchy_rows=has_hierarchy_rows(
                                context=context,
                                taxon_name_id=taxon_name.taxon_name_id,
                            ),
                            infrageneric_confirmed=True,
                            infrageneric_confirmation_note="Linked direct hierarchy parent for infrageneric rank",
                        ):
                            since_commit = maybe_commit(
                                db=db,
                                dry_run=dry_run,
                                commit_every=commit_every,
                                since_commit=since_commit + 1,
                            )
                        log_progress(stats, log_every)
                        continue

                    parent_row = TaxonNameParent(
                        taxon_name_id=taxon_name.taxon_name_id,
                        parent_taxon_name_id=parent.taxon_name_id,
                        sequence=1,
                        created_by=taxon_name.created_by,
                        updated_by=taxon_name.updated_by,
                    )
                    db.add(parent_row)
                    db.flush()
                    context.active_parent_rows_by_taxon_id[
                        taxon_name.taxon_name_id
                    ].append(parent_row)
                    wrote_review = refresh_review_row_from_existing_parents(
                        db=db,
                        context=context,
                        taxon_name=taxon_name,
                        active_parent_rows=context.active_parent_rows_by_taxon_id[
                            taxon_name.taxon_name_id
                        ],
                        fallback_reason="auto_matched_infrageneric_hierarchy_parent",
                    )
                    since_commit = maybe_commit(
                        db=db,
                        dry_run=dry_run,
                        commit_every=commit_every,
                        since_commit=since_commit + 1 + (1 if wrote_review else 0),
                    )
                    log_progress(stats, log_every)
                    continue

                uninomial = (taxon_name.uninomial or "").strip()
                if not uninomial:
                    stats.skipped_blank += 1
                    if upsert_review_row(
                        db=db,
                        context=context,
                        taxon_name=taxon_name,
                        status="unmatched",
                        reason="blank_uninomial",
                        candidate_parent_ids=[],
                        candidate_parent_names=[],
                        derived_uninomial=None,
                        has_hierarchy_rows=has_hierarchy_rows(
                            context=context,
                            taxon_name_id=taxon_name.taxon_name_id,
                        ),
                    ):
                        since_commit = maybe_commit(
                            db=db,
                            dry_run=dry_run,
                            commit_every=commit_every,
                            since_commit=since_commit + 1,
                        )
                    log_progress(stats, log_every)
                    continue

                (
                    infrageneric_matches,
                    infrageneric_match_note,
                    infrageneric_matched_in_hierarchy,
                ) = find_infrageneric_parent_candidates(
                    context=context,
                    taxon_name=taxon_name,
                )
                if len(infrageneric_matches) == 1:
                    parent = infrageneric_matches[0]
                    stats.created += 1
                    hierarchy_confirmed = bool(infrageneric_matched_in_hierarchy)

                    if dry_run:
                        status, reason = classify_candidate_match_state(
                            context=context,
                            taxon_name=taxon_name,
                            derived_uninomial=parent.uninomial,
                            fallback_reason="auto_matched_infrageneric_parent",
                            hierarchy_confirmed=hierarchy_confirmed,
                            infrageneric_confirmed=True,
                        )
                        if upsert_review_row(
                            db=db,
                            context=context,
                            taxon_name=taxon_name,
                            status=status,
                            reason=reason,
                            candidate_parent_ids=[parent.taxon_name_id],
                            candidate_parent_names=[parent.uninomial or ""],
                            derived_uninomial=parent.uninomial,
                            hierarchy_confirmed=hierarchy_confirmed,
                            hierarchy_confirmation_note=(
                                infrageneric_match_note if hierarchy_confirmed else None
                            ),
                            has_hierarchy_rows=has_hierarchy_rows(
                                context=context,
                                taxon_name_id=taxon_name.taxon_name_id,
                            ),
                            infrageneric_confirmed=True,
                            infrageneric_confirmation_note=infrageneric_match_note,
                        ):
                            since_commit = maybe_commit(
                                db=db,
                                dry_run=dry_run,
                                commit_every=commit_every,
                                since_commit=since_commit + 1,
                            )
                        log_progress(stats, log_every)
                        continue

                    parent_row = TaxonNameParent(
                        taxon_name_id=taxon_name.taxon_name_id,
                        parent_taxon_name_id=parent.taxon_name_id,
                        sequence=1,
                        created_by=taxon_name.created_by,
                        updated_by=taxon_name.updated_by,
                    )
                    db.add(parent_row)
                    db.flush()
                    context.active_parent_rows_by_taxon_id[
                        taxon_name.taxon_name_id
                    ].append(parent_row)
                    wrote_review = refresh_review_row_from_existing_parents(
                        db=db,
                        context=context,
                        taxon_name=taxon_name,
                        active_parent_rows=context.active_parent_rows_by_taxon_id[
                            taxon_name.taxon_name_id
                        ],
                        fallback_reason="auto_matched_infrageneric_parent",
                    )
                    since_commit = maybe_commit(
                        db=db,
                        dry_run=dry_run,
                        commit_every=commit_every,
                        since_commit=since_commit + 1 + (1 if wrote_review else 0),
                    )
                    log_progress(stats, log_every)
                    continue

                hierarchy_matches = filter_valid_parent_candidates(
                    context=context,
                    taxon_name=taxon_name,
                    matches=find_hierarchy_candidate_parents(
                        context=context,
                        taxon_name_id=taxon_name.taxon_name_id,
                        uninomial=uninomial,
                    ),
                )
                if len(hierarchy_matches) == 1:
                    parent = hierarchy_matches[0]
                    stats.created += 1

                    if dry_run:
                        infrageneric_confirmed, infrageneric_confirmation_note = (
                            get_infrageneric_confirmation(
                                context=context,
                                taxon_name=taxon_name,
                            )
                        )
                        status, reason = classify_candidate_match_state(
                            context=context,
                            taxon_name=taxon_name,
                            derived_uninomial=parent.uninomial,
                            fallback_reason="auto_matched_hierarchy_first",
                            hierarchy_confirmed=True,
                            infrageneric_confirmed=infrageneric_confirmed,
                        )
                        if upsert_review_row(
                            db=db,
                            context=context,
                            taxon_name=taxon_name,
                            status=status,
                            reason=reason,
                            candidate_parent_ids=[parent.taxon_name_id],
                            candidate_parent_names=[parent.uninomial or ""],
                            derived_uninomial=parent.uninomial,
                            hierarchy_confirmed=True,
                            hierarchy_confirmation_note="Matched from hierarchy parent before uninomial fallback",
                            has_hierarchy_rows=has_hierarchy_rows(
                                context=context,
                                taxon_name_id=taxon_name.taxon_name_id,
                            ),
                            infrageneric_confirmed=infrageneric_confirmed,
                            infrageneric_confirmation_note=infrageneric_confirmation_note,
                        ):
                            since_commit = maybe_commit(
                                db=db,
                                dry_run=dry_run,
                                commit_every=commit_every,
                                since_commit=since_commit + 1,
                            )
                        log_progress(stats, log_every)
                        continue

                    parent_row = TaxonNameParent(
                        taxon_name_id=taxon_name.taxon_name_id,
                        parent_taxon_name_id=parent.taxon_name_id,
                        sequence=1,
                        created_by=taxon_name.created_by,
                        updated_by=taxon_name.updated_by,
                    )
                    db.add(parent_row)
                    db.flush()
                    context.active_parent_rows_by_taxon_id[
                        taxon_name.taxon_name_id
                    ].append(parent_row)
                    wrote_review = refresh_review_row_from_existing_parents(
                        db=db,
                        context=context,
                        taxon_name=taxon_name,
                        active_parent_rows=context.active_parent_rows_by_taxon_id[
                            taxon_name.taxon_name_id
                        ],
                        fallback_reason="auto_matched_hierarchy_first",
                    )
                    since_commit = maybe_commit(
                        db=db,
                        dry_run=dry_run,
                        commit_every=commit_every,
                        since_commit=since_commit + 1 + (1 if wrote_review else 0),
                    )
                    log_progress(stats, log_every)
                    continue

                matches = (
                    hierarchy_matches
                    if len(hierarchy_matches) > 1
                    else filter_valid_parent_candidates(
                        context=context,
                        taxon_name=taxon_name,
                        matches=context.candidate_matches_by_taxon_id.get(
                            taxon_name.taxon_name_id, []
                        ),
                    )
                )

                if not matches:
                    stats.skipped_self_only += 1
                    if upsert_review_row(
                        db=db,
                        context=context,
                        taxon_name=taxon_name,
                        status="unmatched",
                        reason="no_candidate_parent",
                        candidate_parent_ids=[],
                        candidate_parent_names=[],
                        derived_uninomial=None,
                        has_hierarchy_rows=has_hierarchy_rows(
                            context=context,
                            taxon_name_id=taxon_name.taxon_name_id,
                        ),
                    ):
                        since_commit = maybe_commit(
                            db=db,
                            dry_run=dry_run,
                            commit_every=commit_every,
                            since_commit=since_commit + 1,
                        )
                    log_progress(stats, log_every)
                    continue

                if len(matches) > 1:
                    hierarchy_confirmed_matches, hierarchy_note = (
                        filter_matches_by_hierarchy(
                            context=context,
                            taxon_name_id=taxon_name.taxon_name_id,
                            matches=matches,
                        )
                    )
                    hierarchy_confirmed_matches = filter_valid_parent_candidates(
                        context=context,
                        taxon_name=taxon_name,
                        matches=hierarchy_confirmed_matches,
                    )
                    if len(hierarchy_confirmed_matches) == 1:
                        parent = hierarchy_confirmed_matches[0]
                        stats.created += 1

                        if dry_run:
                            infrageneric_confirmed, infrageneric_confirmation_note = (
                                get_infrageneric_confirmation(
                                    context=context,
                                    taxon_name=taxon_name,
                                )
                            )
                            status, reason = classify_candidate_match_state(
                                context=context,
                                taxon_name=taxon_name,
                                derived_uninomial=parent.uninomial,
                                fallback_reason="auto_matched_hierarchy_confirmed",
                                hierarchy_confirmed=True,
                                infrageneric_confirmed=infrageneric_confirmed,
                            )
                            if upsert_review_row(
                                db=db,
                                context=context,
                                taxon_name=taxon_name,
                                status=status,
                                reason=reason,
                                candidate_parent_ids=[parent.taxon_name_id],
                                candidate_parent_names=[parent.uninomial or ""],
                                derived_uninomial=parent.uninomial,
                                hierarchy_confirmed=True,
                                hierarchy_confirmation_note=hierarchy_note,
                                has_hierarchy_rows=has_hierarchy_rows(
                                    context=context,
                                    taxon_name_id=taxon_name.taxon_name_id,
                                ),
                                infrageneric_confirmed=infrageneric_confirmed,
                                infrageneric_confirmation_note=infrageneric_confirmation_note,
                            ):
                                since_commit = maybe_commit(
                                    db=db,
                                    dry_run=dry_run,
                                    commit_every=commit_every,
                                    since_commit=since_commit + 1,
                                )
                            log_progress(stats, log_every)
                            continue

                        parent_row = TaxonNameParent(
                            taxon_name_id=taxon_name.taxon_name_id,
                            parent_taxon_name_id=parent.taxon_name_id,
                            sequence=1,
                            created_by=taxon_name.created_by,
                            updated_by=taxon_name.updated_by,
                        )
                        db.add(parent_row)
                        db.flush()
                        context.active_parent_rows_by_taxon_id[
                            taxon_name.taxon_name_id
                        ].append(parent_row)
                        wrote_review = refresh_review_row_from_existing_parents(
                            db=db,
                            context=context,
                            taxon_name=taxon_name,
                            active_parent_rows=context.active_parent_rows_by_taxon_id[
                                taxon_name.taxon_name_id
                            ],
                            fallback_reason="auto_matched_hierarchy_confirmed",
                        )
                        since_commit = maybe_commit(
                            db=db,
                            dry_run=dry_run,
                            commit_every=commit_every,
                            since_commit=since_commit + 1 + (1 if wrote_review else 0),
                        )
                        log_progress(stats, log_every)
                        continue

                    reduced_matches, reduction_note = reduce_ambiguous_matches(
                        context=context,
                        taxon_name=taxon_name,
                        matches=hierarchy_confirmed_matches or matches,
                    )
                    reduced_matches = filter_valid_parent_candidates(
                        context=context,
                        taxon_name=taxon_name,
                        matches=reduced_matches,
                    )
                    if len(reduced_matches) == 1:
                        parent = reduced_matches[0]
                        stats.created += 1
                        reduction_reason = (
                            "auto_matched_reduced_ambiguous_hierarchy"
                            if hierarchy_confirmed_matches
                            else "auto_matched_reduced_ambiguous"
                        )

                        if dry_run:
                            infrageneric_confirmed, infrageneric_confirmation_note = (
                                get_infrageneric_confirmation(
                                    context=context,
                                    taxon_name=taxon_name,
                                )
                            )
                            status, reason = classify_candidate_match_state(
                                context=context,
                                taxon_name=taxon_name,
                                derived_uninomial=parent.uninomial,
                                fallback_reason=reduction_reason,
                                hierarchy_confirmed=bool(hierarchy_confirmed_matches),
                                infrageneric_confirmed=infrageneric_confirmed,
                            )
                            if upsert_review_row(
                                db=db,
                                context=context,
                                taxon_name=taxon_name,
                                status=status,
                                reason=reason,
                                candidate_parent_ids=[parent.taxon_name_id],
                                candidate_parent_names=[parent.uninomial or ""],
                                derived_uninomial=parent.uninomial,
                                hierarchy_confirmed=bool(hierarchy_confirmed_matches),
                                hierarchy_confirmation_note=join_notes(
                                    hierarchy_note,
                                    reduction_note,
                                ),
                                has_hierarchy_rows=has_hierarchy_rows(
                                    context=context,
                                    taxon_name_id=taxon_name.taxon_name_id,
                                ),
                                infrageneric_confirmed=infrageneric_confirmed,
                                infrageneric_confirmation_note=infrageneric_confirmation_note,
                            ):
                                since_commit = maybe_commit(
                                    db=db,
                                    dry_run=dry_run,
                                    commit_every=commit_every,
                                    since_commit=since_commit + 1,
                                )
                            log_progress(stats, log_every)
                            continue

                        parent_row = TaxonNameParent(
                            taxon_name_id=taxon_name.taxon_name_id,
                            parent_taxon_name_id=parent.taxon_name_id,
                            sequence=1,
                            created_by=taxon_name.created_by,
                            updated_by=taxon_name.updated_by,
                        )
                        db.add(parent_row)
                        db.flush()
                        context.active_parent_rows_by_taxon_id[
                            taxon_name.taxon_name_id
                        ].append(parent_row)
                        wrote_review = refresh_review_row_from_existing_parents(
                            db=db,
                            context=context,
                            taxon_name=taxon_name,
                            active_parent_rows=context.active_parent_rows_by_taxon_id[
                                taxon_name.taxon_name_id
                            ],
                            fallback_reason=reduction_reason,
                        )
                        since_commit = maybe_commit(
                            db=db,
                            dry_run=dry_run,
                            commit_every=commit_every,
                            since_commit=since_commit + 1 + (1 if wrote_review else 0),
                        )
                        log_progress(stats, log_every)
                        continue

                    infrageneric_confirmed, infrageneric_confirmation_note = (
                        get_infrageneric_confirmation(
                            context=context,
                            taxon_name=taxon_name,
                        )
                    )
                    stats.skipped_ambiguous += 1
                    if upsert_review_row(
                        db=db,
                        context=context,
                        taxon_name=taxon_name,
                        status="ambiguous",
                        reason=(
                            "multiple_hierarchy_candidate_parents"
                            if len(hierarchy_matches) > 1
                            else "multiple_candidate_parents"
                        ),
                        candidate_parent_ids=[
                            match.taxon_name_id for match in reduced_matches
                        ],
                        candidate_parent_names=[
                            match.uninomial or "" for match in reduced_matches
                        ],
                        derived_uninomial=None,
                        hierarchy_confirmed=bool(hierarchy_confirmed_matches),
                        hierarchy_confirmation_note=join_notes(
                            hierarchy_note,
                            reduction_note,
                        ),
                        has_hierarchy_rows=has_hierarchy_rows(
                            context=context,
                            taxon_name_id=taxon_name.taxon_name_id,
                        ),
                        infrageneric_confirmed=infrageneric_confirmed,
                        infrageneric_confirmation_note=infrageneric_confirmation_note,
                    ):
                        since_commit = maybe_commit(
                            db=db,
                            dry_run=dry_run,
                            commit_every=commit_every,
                            since_commit=since_commit + 1,
                        )
                    log_progress(stats, log_every)
                    continue

                parent = matches[0]
                hierarchy_confirmed, hierarchy_confirmation_note = (
                    get_hierarchy_confirmation(
                        context=context,
                        taxon_name_id=taxon_name.taxon_name_id,
                        candidate_parent_ids=[parent.taxon_name_id],
                    )
                )
                infrageneric_confirmed, infrageneric_confirmation_note = (
                    get_infrageneric_confirmation(
                        context=context,
                        taxon_name=taxon_name,
                    )
                )
                stats.created += 1

                if dry_run:
                    status, reason = classify_candidate_match_state(
                        context=context,
                        taxon_name=taxon_name,
                        candidate_parent_taxon_names=[parent],
                        derived_uninomial=parent.uninomial,
                        fallback_reason="auto_matched_unique_uninomial",
                        hierarchy_confirmed=hierarchy_confirmed,
                        infrageneric_confirmed=infrageneric_confirmed,
                    )
                    if upsert_review_row(
                        db=db,
                        context=context,
                        taxon_name=taxon_name,
                        status=status,
                        reason=reason,
                        candidate_parent_ids=[parent.taxon_name_id],
                        candidate_parent_names=[parent.uninomial or ""],
                        derived_uninomial=parent.uninomial,
                        hierarchy_confirmed=hierarchy_confirmed,
                        hierarchy_confirmation_note=hierarchy_confirmation_note,
                        has_hierarchy_rows=has_hierarchy_rows(
                            context=context,
                            taxon_name_id=taxon_name.taxon_name_id,
                        ),
                        infrageneric_confirmed=infrageneric_confirmed,
                        infrageneric_confirmation_note=infrageneric_confirmation_note,
                    ):
                        since_commit = maybe_commit(
                            db=db,
                            dry_run=dry_run,
                            commit_every=commit_every,
                            since_commit=since_commit + 1,
                        )
                    log_progress(stats, log_every)
                    continue

                parent_row = TaxonNameParent(
                    taxon_name_id=taxon_name.taxon_name_id,
                    parent_taxon_name_id=parent.taxon_name_id,
                    sequence=1,
                    created_by=taxon_name.created_by,
                    updated_by=taxon_name.updated_by,
                )
                db.add(parent_row)
                db.flush()
                context.active_parent_rows_by_taxon_id[taxon_name.taxon_name_id].append(
                    parent_row
                )
                wrote_review = refresh_review_row_from_existing_parents(
                    db=db,
                    context=context,
                    taxon_name=taxon_name,
                    active_parent_rows=context.active_parent_rows_by_taxon_id[
                        taxon_name.taxon_name_id
                    ],
                    fallback_reason="auto_matched_unique_uninomial",
                )
                since_commit = maybe_commit(
                    db=db,
                    dry_run=dry_run,
                    commit_every=commit_every,
                    since_commit=since_commit + 1 + (1 if wrote_review else 0),
                )
                log_progress(stats, log_every)
            except Exception as error:
                stats.failed += 1
                db.rollback()
                print(
                    "Failed row: "
                    f"taxon_name_id={taxon_name.taxon_name_id} "
                    f"reason={error}"
                )
                log_progress(stats, log_every)

        last_seen_taxon_name_id = batch[-1].taxon_name_id
        if last_seen_taxon_name_id is None:
            current_offset += len(batch)
        if remaining is not None:
            remaining -= len(batch)
            if remaining <= 0:
                break

    if dry_run:
        db.rollback()
    else:
        if since_commit > 0:
            print(f"Committed final batch of {since_commit} writes.")
        db.commit()


def build_batch_context(db: Session, batch: list[TaxonName]) -> BatchContext:
    context = BatchContext()
    taxon_ids = [taxon_name.taxon_name_id for taxon_name in batch]
    if not taxon_ids:
        return context

    for taxon_name in batch:
        context.taxon_names_by_id[taxon_name.taxon_name_id] = taxon_name

    review_rows = (
        db.query(TaxonNameParentReview)
        .filter(
            TaxonNameParentReview.deleted.is_(False),
            TaxonNameParentReview.taxon_name_id.in_(taxon_ids),
        )
        .all()
    )
    context.review_rows_by_taxon_id = {row.taxon_name_id: row for row in review_rows}

    active_parent_rows = (
        db.query(TaxonNameParent)
        .filter(
            TaxonNameParent.deleted.is_(False),
            TaxonNameParent.taxon_name_id.in_(taxon_ids),
        )
        .order_by(
            TaxonNameParent.taxon_name_id.asc(),
            TaxonNameParent.sequence.asc(),
            TaxonNameParent.parent_taxon_name_id.asc(),
        )
        .all()
    )
    for row in active_parent_rows:
        context.active_parent_rows_by_taxon_id[row.taxon_name_id].append(row)

    active_hierarchies = (
        db.query(Hierarchy)
        .filter(
            Hierarchy.deleted.is_(False),
            Hierarchy.taxon_name_id.in_(taxon_ids),
        )
        .order_by(
            Hierarchy.taxon_name_id.asc(),
            Hierarchy.classification_system_id.asc(),
            Hierarchy.hierarchy_id.asc(),
        )
        .all()
    )
    for row in active_hierarchies:
        context.active_hierarchies_by_taxon_id[row.taxon_name_id].append(row)

    normalized_uninomials = {
        normalize_uninomial(taxon_name.uninomial)
        for taxon_name in batch
        if normalize_uninomial(taxon_name.uninomial)
    }
    normalized_bracketed_names = set()
    for taxon_name in batch:
        bracketed_name = extract_bracketed_infrageneric_name(taxon_name)
        if bracketed_name:
            normalized_bracketed_names.add(bracketed_name)
    normalized_lookup_names = normalized_uninomials | normalized_bracketed_names
    candidate_rows: list[TaxonName] = []
    if normalized_lookup_names:
        sibling = aliased(TaxonName)
        candidate_rows = (
            db.query(sibling)
            .filter(
                sibling.deleted.is_(False),
                sibling.uninomial.isnot(None),
                func.lower(func.trim(sibling.uninomial)).in_(
                    sorted(normalized_lookup_names)
                ),
            )
            .order_by(sibling.taxon_name_id.asc())
            .all()
        )

    parent_taxon_ids = {row.parent_taxon_name_id for row in active_parent_rows} | {
        row.parent_nid for row in active_hierarchies if row.parent_nid
    }
    extra_taxon_ids = parent_taxon_ids.difference(context.taxon_names_by_id.keys())
    if extra_taxon_ids:
        extra_taxa = (
            db.query(TaxonName)
            .filter(
                TaxonName.deleted.is_(False),
                TaxonName.taxon_name_id.in_(sorted(extra_taxon_ids)),
            )
            .all()
        )
        for row in extra_taxa:
            context.taxon_names_by_id[row.taxon_name_id] = row

    rank_ids = sorted(
        {
            row.rank_id
            for row in context.taxon_names_by_id.values()
            if row.rank_id is not None
        }
    )
    if rank_ids:
        context.taxon_ranks_by_id = {
            row.taxon_rank_id: row
            for row in (
                db.query(TaxonRank)
                .filter(
                    TaxonRank.deleted.is_(False),
                    TaxonRank.taxon_rank_id.in_(rank_ids),
                )
                .all()
            )
        }

    candidate_rows_by_uninomial: dict[str, list[TaxonName]] = defaultdict(list)
    for row in candidate_rows:
        context.taxon_names_by_id[row.taxon_name_id] = row
        normalized = normalize_uninomial(row.uninomial)
        if normalized:
            candidate_rows_by_uninomial[normalized].append(row)

    for normalized_name, rows in candidate_rows_by_uninomial.items():
        context.subgenus_matches_by_name[normalized_name] = [
            row
            for row in rows
            if context.taxon_ranks_by_id.get(row.rank_id)
            and (context.taxon_ranks_by_id[row.rank_id].rank_name or "").strip().lower()
            == "subgenus"
        ]

    for taxon_name in batch:
        normalized = normalize_uninomial(taxon_name.uninomial)
        if not normalized:
            context.candidate_matches_by_taxon_id[taxon_name.taxon_name_id] = []
            continue
        context.candidate_matches_by_taxon_id[taxon_name.taxon_name_id] = [
            row
            for row in candidate_rows_by_uninomial.get(normalized, [])
            if row.taxon_name_id != taxon_name.taxon_name_id
        ]

    return context


def normalize_uninomial(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip().lower()
    return normalized or None


def extract_bracketed_infrageneric_name(taxon_name: TaxonName) -> str | None:
    scientific_name = (taxon_name.scientific_name or "").strip()
    if not scientific_name:
        return None
    match = BRACKETED_INFRAGENERIC_RE.match(scientific_name)
    if not match:
        return None
    return normalize_uninomial(match.group(1))


def find_hierarchy_candidate_parents(
    *,
    context: BatchContext,
    taxon_name_id: int,
    uninomial: str,
) -> list[TaxonName]:
    normalized_uninomial = normalize_uninomial(uninomial)
    if not normalized_uninomial:
        return []

    matches: list[TaxonName] = []
    seen_ids: set[int] = set()
    for row in context.active_hierarchies_by_taxon_id.get(taxon_name_id, []):
        parent = context.taxon_names_by_id.get(row.parent_nid)
        if not parent or parent.taxon_name_id in seen_ids:
            continue
        if normalize_uninomial(parent.uninomial) == normalized_uninomial:
            matches.append(parent)
            seen_ids.add(parent.taxon_name_id)
    return matches


def find_infrageneric_parent_candidates(
    *,
    context: BatchContext,
    taxon_name: TaxonName,
) -> tuple[list[TaxonName], str | None, bool | None]:
    bracketed_name = extract_bracketed_infrageneric_name(taxon_name)
    if not bracketed_name:
        return [], None, None

    hierarchy_matches: list[TaxonName] = []
    seen_ids: set[int] = set()
    for row in context.active_hierarchies_by_taxon_id.get(taxon_name.taxon_name_id, []):
        parent = context.taxon_names_by_id.get(row.parent_nid)
        if not parent or parent.taxon_name_id in seen_ids:
            continue
        rank = context.taxon_ranks_by_id.get(parent.rank_id)
        if not rank or (rank.rank_name or "").strip().lower() != "subgenus":
            continue
        if normalize_uninomial(parent.uninomial) == bracketed_name:
            hierarchy_matches.append(parent)
            seen_ids.add(parent.taxon_name_id)

    if hierarchy_matches:
        return (
            hierarchy_matches,
            "Bracketed scientific-name segment matched Subgenus hierarchy parent",
            True,
        )

    subgenus_matches = context.subgenus_matches_by_name.get(bracketed_name, [])
    if subgenus_matches:
        return (
            subgenus_matches,
            "Bracketed scientific-name segment matched Subgenus taxon",
            False,
        )

    return [], "Bracketed scientific-name segment did not match a Subgenus taxon", False


def refresh_review_row_from_existing_parents(
    *,
    db: Session,
    context: BatchContext,
    taxon_name: TaxonName,
    active_parent_rows: list[TaxonNameParent],
    fallback_reason: str | None = None,
) -> bool:
    candidate_parents = get_parent_taxon_names(context, active_parent_rows)
    candidate_parent_ids = [parent.taxon_name_id for parent in candidate_parents]
    candidate_parent_names = [parent.uninomial or "" for parent in candidate_parents]
    derived_uninomial = derive_uninomial_from_parents(taxon_name, candidate_parents)
    hierarchy_confirmed, hierarchy_confirmation_note = get_hierarchy_confirmation(
        context=context,
        taxon_name_id=taxon_name.taxon_name_id,
        candidate_parent_ids=candidate_parent_ids,
    )
    infrageneric_confirmed, infrageneric_confirmation_note = (
        get_infrageneric_confirmation(
            context=context,
            taxon_name=taxon_name,
        )
    )
    status, reason = classify_existing_parent_state(
        context=context,
        taxon_name=taxon_name,
        parent_taxon_names=candidate_parents,
        parent_count=len(candidate_parents),
        derived_uninomial=derived_uninomial,
        fallback_reason=fallback_reason,
        hierarchy_confirmed=hierarchy_confirmed,
        infrageneric_confirmed=infrageneric_confirmed,
    )

    return upsert_review_row(
        db=db,
        context=context,
        taxon_name=taxon_name,
        status=status,
        reason=reason,
        candidate_parent_ids=candidate_parent_ids,
        candidate_parent_names=candidate_parent_names,
        derived_uninomial=derived_uninomial,
        hierarchy_confirmed=hierarchy_confirmed,
        hierarchy_confirmation_note=hierarchy_confirmation_note,
        has_hierarchy_rows=has_hierarchy_rows(
            context=context,
            taxon_name_id=taxon_name.taxon_name_id,
        ),
        infrageneric_confirmed=infrageneric_confirmed,
        infrageneric_confirmation_note=infrageneric_confirmation_note,
    )


def get_parent_taxon_names(
    context: BatchContext,
    active_parent_rows: list[TaxonNameParent],
) -> list[TaxonName]:
    ordered_parents: list[TaxonName] = []
    for row in active_parent_rows:
        parent = context.taxon_names_by_id.get(row.parent_taxon_name_id)
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
    context: BatchContext,
    taxon_name: TaxonName,
    parent_taxon_names: list[TaxonName],
    parent_count: int,
    derived_uninomial: str | None,
    fallback_reason: str | None,
    hierarchy_confirmed: bool | None,
    infrageneric_confirmed: bool | None,
) -> tuple[str, str]:
    hybrid_category = getattr(taxon_name, "hybrid_category", None)
    hybrid_value = hybrid_category.value if hybrid_category else None
    legacy_uninomial = (taxon_name.uninomial or "").strip()
    derived_value = (derived_uninomial or "").strip()

    if parent_count >= 2 and not hybrid_value:
        return "matched_needs_review", "missing_hybrid_category"

    if legacy_uninomial and derived_value and legacy_uninomial != derived_value:
        if auto_resolved_confirmed_subgenus_parent_match(
            context=context,
            taxon_name=taxon_name,
            parent_taxon_names=parent_taxon_names,
            fallback_reason=fallback_reason,
            hierarchy_confirmed=hierarchy_confirmed,
            infrageneric_confirmed=infrageneric_confirmed,
        ):
            return "resolved", "auto_resolved_confirmed_subgenus_parent"
        if infrageneric_confirmed:
            return (
                "matched_needs_review",
                fallback_reason or "infrageneric_parent_match",
            )
        return "mismatch", "derived_name_mismatch"

    if legacy_uninomial and derived_value and legacy_uninomial == derived_value:
        if hierarchy_confirmed:
            return "resolved", "auto_resolved_hierarchy_confirmed"
        if infrageneric_confirmed:
            return "resolved", "auto_resolved_infrageneric_confirmed"
        if single_species_to_genus_unique_uninomial_match(
            context=context,
            taxon_name=taxon_name,
            parent_taxon_names=parent_taxon_names,
            fallback_reason=fallback_reason,
            legacy_uninomial=legacy_uninomial,
            derived_uninomial=derived_value,
        ):
            return "resolved", "auto_resolved_single_genus_unique_uninomial"
        if single_species_to_subgenus_unique_uninomial_match(
            context=context,
            taxon_name=taxon_name,
            parent_taxon_names=parent_taxon_names,
            fallback_reason=fallback_reason,
            legacy_uninomial=legacy_uninomial,
            derived_uninomial=derived_value,
        ):
            return "resolved", "auto_resolved_single_subgenus_unique_uninomial"
        if single_species_to_subgenus_unique_uninomial_match(
            context=context,
            taxon_name=taxon_name,
            parent_taxon_names=parent_taxon_names,
            fallback_reason=fallback_reason,
            legacy_uninomial=legacy_uninomial,
            derived_uninomial=derived_value,
        ):
            return "resolved", "auto_resolved_single_subgenus_unique_uninomial"

    if fallback_reason:
        return "matched_needs_review", fallback_reason

    return "matched_needs_review", "existing_parent_links"


def classify_candidate_match_state(
    *,
    context: BatchContext,
    taxon_name: TaxonName,
    candidate_parent_taxon_names: list[TaxonName] | None = None,
    derived_uninomial: str | None,
    fallback_reason: str,
    hierarchy_confirmed: bool | None,
    infrageneric_confirmed: bool | None,
) -> tuple[str, str]:
    legacy_uninomial = (taxon_name.uninomial or "").strip()
    derived_value = (derived_uninomial or "").strip()

    if is_infrageneric_parent_link_rank(context, taxon_name):
        return "matched_needs_review", fallback_reason

    if legacy_uninomial and derived_value and legacy_uninomial != derived_value:
        if auto_resolved_confirmed_subgenus_parent_match(
            context=context,
            taxon_name=taxon_name,
            parent_taxon_names=candidate_parent_taxon_names or [],
            fallback_reason=fallback_reason,
            hierarchy_confirmed=hierarchy_confirmed,
            infrageneric_confirmed=infrageneric_confirmed,
        ):
            return "resolved", "auto_resolved_confirmed_subgenus_parent"
        if infrageneric_confirmed:
            return "matched_needs_review", fallback_reason
        return "mismatch", "derived_name_mismatch"

    if legacy_uninomial and derived_value and legacy_uninomial == derived_value:
        if hierarchy_confirmed:
            return "resolved", "auto_resolved_hierarchy_confirmed"
        if infrageneric_confirmed:
            return "resolved", "auto_resolved_infrageneric_confirmed"
        if single_species_to_genus_unique_uninomial_match(
            context=context,
            taxon_name=taxon_name,
            parent_taxon_names=candidate_parent_taxon_names or [],
            fallback_reason=fallback_reason,
            legacy_uninomial=legacy_uninomial,
            derived_uninomial=derived_value,
        ):
            return "resolved", "auto_resolved_single_genus_unique_uninomial"
        if single_species_to_subgenus_unique_uninomial_match(
            context=context,
            taxon_name=taxon_name,
            parent_taxon_names=candidate_parent_taxon_names or [],
            fallback_reason=fallback_reason,
            legacy_uninomial=legacy_uninomial,
            derived_uninomial=derived_value,
        ):
            return "resolved", "auto_resolved_single_subgenus_unique_uninomial"

    return "matched_needs_review", fallback_reason


def single_species_to_genus_unique_uninomial_match(
    *,
    context: BatchContext,
    taxon_name: TaxonName,
    parent_taxon_names: list[TaxonName],
    fallback_reason: str | None,
    legacy_uninomial: str,
    derived_uninomial: str,
) -> bool:
    if fallback_reason not in {
        "auto_matched_unique_uninomial",
        "existing_parent_links",
        None,
    }:
        return False
    if get_rank_name(context, taxon_name) != "species":
        return False
    if len(parent_taxon_names) != 1:
        return False

    parent = parent_taxon_names[0]
    if get_rank_name(context, parent) != "genus":
        return False

    parent_uninomial = (parent.uninomial or "").strip()
    if not parent_uninomial:
        return False

    return parent_uninomial == legacy_uninomial == derived_uninomial


def single_species_to_subgenus_unique_uninomial_match(
    *,
    context: BatchContext,
    taxon_name: TaxonName,
    parent_taxon_names: list[TaxonName],
    fallback_reason: str | None,
    legacy_uninomial: str,
    derived_uninomial: str,
) -> bool:
    if fallback_reason not in {
        "auto_matched_unique_uninomial",
        "existing_parent_links",
        None,
    }:
        return False
    if get_rank_name(context, taxon_name) != "species":
        return False
    if len(parent_taxon_names) != 1:
        return False

    parent = parent_taxon_names[0]
    if get_rank_name(context, parent) != "subgenus":
        return False

    parent_uninomial = (parent.uninomial or "").strip()
    if not parent_uninomial:
        return False

    return parent_uninomial == legacy_uninomial == derived_uninomial


def auto_resolved_confirmed_subgenus_parent_match(
    *,
    context: BatchContext,
    taxon_name: TaxonName,
    parent_taxon_names: list[TaxonName],
    fallback_reason: str | None,
    hierarchy_confirmed: bool | None,
    infrageneric_confirmed: bool | None,
) -> bool:
    if fallback_reason != "infrageneric_parent_match":
        return False
    if not hierarchy_confirmed or not infrageneric_confirmed:
        return False
    if len(parent_taxon_names) != 1:
        return False
    return get_rank_name(context, parent_taxon_names[0]) == "subgenus"


def is_rank_out_of_scope_for_parent_review(
    context: BatchContext,
    taxon_name: TaxonName,
) -> bool:
    rank_name = get_rank_name(context, taxon_name)
    if not rank_name:
        return False
    return rank_name not in PARENT_REVIEW_IN_SCOPE_RANK_NAMES


def get_rank_name(
    context: BatchContext,
    taxon_name: TaxonName,
) -> str:
    rank = context.taxon_ranks_by_id.get(taxon_name.rank_id)
    if not rank:
        return ""
    return (rank.rank_name or "").strip().lower()


def parent_rank_allowed_for_backfill(
    *,
    child_rank_name: str,
    parent_rank_name: str,
) -> bool:
    allowed_parent_ranks = ALLOWED_PARENT_RANKS_BY_CHILD_RANK.get(child_rank_name)
    if allowed_parent_ranks is None:
        return False
    return parent_rank_name in allowed_parent_ranks


def filter_valid_parent_candidates(
    *,
    context: BatchContext,
    taxon_name: TaxonName,
    matches: list[TaxonName],
) -> list[TaxonName]:
    child_rank_name = get_rank_name(context, taxon_name)
    if not child_rank_name:
        return matches

    valid_matches: list[TaxonName] = []
    seen_ids: set[int] = set()
    for parent in matches:
        if not parent or parent.taxon_name_id in seen_ids:
            continue
        parent_rank_name = get_rank_name(context, parent)
        if not parent_rank_allowed_for_backfill(
            child_rank_name=child_rank_name,
            parent_rank_name=parent_rank_name,
        ):
            continue
        valid_matches.append(parent)
        seen_ids.add(parent.taxon_name_id)
    return valid_matches


def is_infrageneric_parent_link_rank(
    context: BatchContext,
    taxon_name: TaxonName,
) -> bool:
    return get_rank_name(context, taxon_name) in INFRAGENERIC_PARENT_LINK_RANK_NAMES


def find_direct_hierarchy_parent_candidates(
    *,
    context: BatchContext,
    taxon_name: TaxonName,
) -> list[TaxonName]:
    matches: list[TaxonName] = []
    seen_ids: set[int] = set()
    for row in context.active_hierarchies_by_taxon_id.get(taxon_name.taxon_name_id, []):
        if not row.parent_nid or row.parent_nid == taxon_name.taxon_name_id:
            continue
        parent = context.taxon_names_by_id.get(row.parent_nid)
        if not parent or parent.taxon_name_id in seen_ids:
            continue
        matches.append(parent)
        seen_ids.add(parent.taxon_name_id)
    return matches


def reduce_ambiguous_matches(
    *,
    context: BatchContext,
    taxon_name: TaxonName,
    matches: list[TaxonName],
) -> tuple[list[TaxonName], str | None]:
    if len(matches) <= 1:
        return matches, None

    notes: list[str] = []
    reduced = matches

    same_kingdom = [
        match for match in reduced if match.kingdom_id == taxon_name.kingdom_id
    ]
    if same_kingdom and len(same_kingdom) < len(reduced):
        reduced = same_kingdom
        notes.append("Reduced to same kingdom candidates")
        if len(reduced) == 1:
            return reduced, join_notes(*notes)

    expected_parent_rank_ids = get_expected_parent_rank_ids(context, taxon_name)
    if expected_parent_rank_ids:
        matching_ranks = [
            match for match in reduced if match.rank_id in expected_parent_rank_ids
        ]
        if matching_ranks and len(matching_ranks) < len(reduced):
            reduced = matching_ranks
            notes.append("Reduced to expected parent rank candidates")
            if len(reduced) == 1:
                return reduced, join_notes(*notes)

    current_matches = [match for match in reduced if bool(match.is_current)]
    if current_matches and len(current_matches) < len(reduced):
        reduced = current_matches
        notes.append("Reduced to current candidates")
        if len(reduced) == 1:
            return reduced, join_notes(*notes)

    return reduced, join_notes(*notes)


def get_expected_parent_rank_ids(
    context: BatchContext,
    taxon_name: TaxonName,
) -> set[int]:
    rank = context.taxon_ranks_by_id.get(taxon_name.rank_id)
    if not rank:
        return set()

    expected_ids = {
        rank_id
        for rank_id in [rank.direct_parent_rank_id, rank.required_parent_rank_id]
        if rank_id is not None
    }
    return expected_ids


def filter_matches_by_hierarchy(
    *,
    context: BatchContext,
    taxon_name_id: int,
    matches: list[TaxonName],
) -> tuple[list[TaxonName], str | None]:
    if not matches:
        return [], None

    match_ids = {match.taxon_name_id for match in matches}
    child_rows = context.active_hierarchies_by_taxon_id.get(taxon_name_id, [])
    if not child_rows:
        return [], "No hierarchy rows available for this taxon"

    confirmed_ids = sorted(
        {row.parent_nid for row in child_rows if row.parent_nid in match_ids}
    )
    if not confirmed_ids:
        return (
            [],
            f"No hierarchy parent match across {len(child_rows)} classification systems",
        )

    confirmed_map = {match.taxon_name_id: match for match in matches}
    confirmed_matches = [
        confirmed_map[confirmed_id]
        for confirmed_id in confirmed_ids
        if confirmed_id in confirmed_map
    ]
    note = f"Hierarchy confirmed in {len(confirmed_ids)} classification systems"
    return confirmed_matches, note


def join_notes(*notes: str | None) -> str | None:
    cleaned = [note for note in notes if note]
    if not cleaned:
        return None
    return " | ".join(cleaned)


def get_hierarchy_confirmation(
    *,
    context: BatchContext,
    taxon_name_id: int,
    candidate_parent_ids: list[int],
) -> tuple[bool | None, str | None]:
    if not candidate_parent_ids:
        return None, None

    child_rows = context.active_hierarchies_by_taxon_id.get(taxon_name_id, [])
    if not child_rows:
        return None, "No hierarchy rows available for this taxon"

    confirmed_rows = [
        row for row in child_rows if row.parent_nid in candidate_parent_ids
    ]
    if confirmed_rows:
        systems = sorted({row.classification_system_id for row in confirmed_rows})
        return (
            True,
            f"Confirmed by hierarchy in classification systems: {', '.join(str(system) for system in systems)}",
        )

    return (
        False,
        f"No linked parent matches hierarchy parent in {len(child_rows)} classification systems",
    )


def has_hierarchy_rows(
    *,
    context: BatchContext,
    taxon_name_id: int,
) -> bool | None:
    child_rows = context.active_hierarchies_by_taxon_id.get(taxon_name_id, [])
    return bool(child_rows)


def get_infrageneric_confirmation(
    *,
    context: BatchContext,
    taxon_name: TaxonName,
) -> tuple[bool | None, str | None]:
    bracketed_name = extract_bracketed_infrageneric_name(taxon_name)
    if not bracketed_name:
        return None, None

    child_rows = context.active_hierarchies_by_taxon_id.get(
        taxon_name.taxon_name_id, []
    )
    hierarchy_matches: list[TaxonName] = []
    seen_ids: set[int] = set()
    for row in child_rows:
        parent = context.taxon_names_by_id.get(row.parent_nid)
        if not parent or parent.taxon_name_id in seen_ids:
            continue
        rank = context.taxon_ranks_by_id.get(parent.rank_id)
        if not rank or (rank.rank_name or "").strip().lower() != "subgenus":
            continue
        if normalize_uninomial(parent.uninomial) == bracketed_name:
            hierarchy_matches.append(parent)
            seen_ids.add(parent.taxon_name_id)

    if hierarchy_matches:
        return True, (
            "Bracketed scientific-name segment matches hierarchy Subgenus parent: "
            + " | ".join(
                parent.uninomial or str(parent.taxon_name_id)
                for parent in hierarchy_matches
            )
        )

    subgenus_matches = context.subgenus_matches_by_name.get(bracketed_name, [])
    if len(subgenus_matches) == 1:
        match = subgenus_matches[0]
        return True, (
            "Bracketed scientific-name segment matches unique Subgenus taxon: "
            f"{match.uninomial or match.scientific_name or match.taxon_name_id}"
        )

    if len(subgenus_matches) > 1:
        return False, (
            "Bracketed scientific-name segment matches multiple Subgenus taxa"
        )

    return False, "Bracketed scientific-name segment does not match a Subgenus taxon"


def upsert_review_row(
    *,
    db: Session,
    context: BatchContext,
    taxon_name: TaxonName,
    status: str,
    reason: str | None,
    candidate_parent_ids: list[int],
    candidate_parent_names: list[str],
    derived_uninomial: str | None,
    hierarchy_confirmed: bool | None = None,
    hierarchy_confirmation_note: str | None = None,
    has_hierarchy_rows: bool | None = None,
    infrageneric_confirmed: bool | None = None,
    infrageneric_confirmation_note: str | None = None,
) -> bool:
    review_row = context.review_rows_by_taxon_id.get(taxon_name.taxon_name_id)
    payload = {
        "status": status,
        "reason": reason,
        "legacy_uninomial": taxon_name.uninomial,
        "derived_uninomial": derived_uninomial,
        "candidate_parent_ids": (
            ",".join(str(value) for value in candidate_parent_ids) or None
        ),
        "candidate_parent_names": (
            " | ".join(name for name in candidate_parent_names if name) or None
        ),
        "parent_count": len(
            context.active_parent_rows_by_taxon_id.get(taxon_name.taxon_name_id, [])
        ),
        "hybrid_category": (
            taxon_name.hybrid_category.value
            if getattr(taxon_name, "hybrid_category", None)
            else None
        ),
        "hierarchy_confirmed": hierarchy_confirmed,
        "hierarchy_confirmation_note": hierarchy_confirmation_note,
        "has_hierarchy_rows": has_hierarchy_rows,
        "infrageneric_confirmed": infrageneric_confirmed,
        "infrageneric_confirmation_note": infrageneric_confirmation_note,
        "reviewed_on": datetime.now(timezone.utc) if status == "resolved" else None,
    }

    if review_row:
        changed = False
        for key, value in payload.items():
            if getattr(review_row, key) != value:
                setattr(review_row, key, value)
                changed = True
        if review_row.updated_by != taxon_name.updated_by:
            review_row.updated_by = taxon_name.updated_by
            changed = True
        if changed:
            db.flush()
        return changed

    review_row = TaxonNameParentReview(
        taxon_name_id=taxon_name.taxon_name_id,
        created_by=taxon_name.created_by,
        updated_by=taxon_name.updated_by,
        **payload,
    )
    db.add(review_row)
    db.flush()
    context.review_rows_by_taxon_id[taxon_name.taxon_name_id] = review_row
    return True


def maybe_commit(
    *,
    db: Session,
    dry_run: bool,
    commit_every: int,
    since_commit: int,
) -> int:
    if dry_run:
        return since_commit
    if commit_every > 0 and since_commit >= commit_every:
        db.commit()
        print(f"Committed batch of {since_commit} writes.")
        return 0
    return since_commit


def log_progress(stats: BackfillStats, log_every: int):
    if log_every <= 0 or stats.processed % log_every != 0:
        return
    print(
        "Progress: "
        f"processed={stats.processed} "
        f"created={stats.created} "
        f"skipped_populated={stats.skipped_populated} "
        f"skipped_reviewed={stats.skipped_reviewed} "
        f"skipped_blank={stats.skipped_blank} "
        f"skipped_self_only={stats.skipped_self_only} "
        f"skipped_ambiguous={stats.skipped_ambiguous} "
        f"failed={stats.failed}"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Backfill taxon_name_parents from hierarchy-first matching with exact unique uninomial fallback."
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of taxon names to inspect.",
    )
    parser.add_argument(
        "--offset", type=int, default=0, help="Offset into the ordered taxon name list."
    )
    parser.add_argument(
        "--skip-populated",
        action="store_true",
        help="Skip creating parent rows for taxon names that already have active parent rows.",
    )
    parser.add_argument(
        "--skip-reviewed",
        action="store_true",
        help="Skip taxon names that already have an active parent review row.",
    )
    parser.add_argument(
        "--only-unresolved",
        action="store_true",
        help="Only process taxon names that already have an unresolved parent review row.",
    )
    parser.add_argument(
        "--only-status",
        type=str,
        default=None,
        help="Comma-separated review statuses to process, e.g. ambiguous,unmatched,matched_needs_review.",
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
        help="Commit every N writes during write mode.",
    )
    parser.add_argument(
        "--log-every",
        type=int,
        default=1000,
        help="Log progress every N processed taxon names.",
    )
    parser.add_argument(
        "--read-batch-size",
        type=int,
        default=READ_BATCH_SIZE_DEFAULT,
        help="Preload review, parent, hierarchy, and uninomial data in batches of this many taxon names.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    only_status = (
        [value.strip() for value in args.only_status.split(",") if value.strip()]
        if args.only_status
        else None
    )
    backfill_taxon_name_parents(
        limit=args.limit,
        offset=args.offset,
        skip_populated=args.skip_populated,
        skip_reviewed=args.skip_reviewed,
        only_unresolved=args.only_unresolved,
        only_status=only_status,
        dry_run=not args.write or args.dry_run,
        commit_every=args.commit_every,
        log_every=args.log_every,
        read_batch_size=args.read_batch_size,
    )
