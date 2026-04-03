# Hybrid And Parallel Name Rollout Runbook

## Purpose

This document describes the operational steps to repeat the current hybrid and
parallel-name rollout on a non-local environment.

The intended order is:

1. deploy and validate on staging
2. review outcomes with the herbarium team
3. repeat on production only after staging is accepted

This runbook is focused on:

- schema changes
- rebuilding `taxon_name_parents`
- rebuilding `taxon_name_parent_review`
- validating the parallel name engine UI and review tools

## Scope

This runbook assumes the code already includes:

- the `taxon_name_parents` model and backfill script
- the `taxon_name_parent_review` queue and supporting fields
- the parallel name preview endpoint and UI
- the parallel name fields on `taxon_names`

## High-Level Sequence

For a clean rollout on staging:

1. deploy the application code
2. run `alembic upgrade head`
3. restart app services
4. optionally clear parent/review data if re-running from scratch
5. run a full parent backfill
6. inspect the review queue and parallel preview
7. run targeted follow-up backfills only if needed
8. capture outcomes and decisions before production

## Pre-Flight Checks

Before touching staging or production:

- confirm the branch/commit being deployed
- confirm a current database backup exists
- confirm the environment has enough time for the full backfill run
- confirm nobody else is actively editing the same rollout data

Recommended checks:

- note the current row counts of `taxon_name_parents`
- note the current row counts of `taxon_name_parent_review`
- note whether this is an initial rollout or a rebuild

## Staging Rollout

### 1. Deploy the code

Deploy the backend and frontend code to staging in the usual way for Nomos.

This rollout depends on both:

- backend changes
- frontend/admin changes

### 2. Run database migrations

From the app root on staging:

```bash
cd /path/to/Nomos
make upgrade
```

Equivalent command:

```bash
docker compose run --rm backend alembic upgrade head
```

### 3. Restart services

```bash
docker compose restart backend nginx frontend
```

If `frontend` is not separately managed in that environment, restart the services
used there instead.

## Clean Rebuild Option

Use this only if staging should be rebuilt from scratch.

This is the cleanest path when you want to prove the entire process end to end.

### 4. Clear rollout tables

This removes existing generated parent-link and review-queue data so the rollout
can be replayed cleanly.

```bash
docker compose run --rm backend python - <<'PY'
import app.model  # noqa: F401
from app.db.session import get_db
from app.db.taxon_name_parent.model import TaxonNameParent
from app.db.taxon_name_parent_review.model import TaxonNameParentReview

db = get_db().__next__()
try:
    deleted_parents = db.query(TaxonNameParent).delete(synchronize_session=False)
    deleted_reviews = db.query(TaxonNameParentReview).delete(synchronize_session=False)
    db.commit()
    print(f"Deleted taxon_name_parents rows: {deleted_parents}")
    print(f"Deleted taxon_name_parent_review rows: {deleted_reviews}")
finally:
    db.close()
PY
```

Then restart services again:

```bash
docker compose restart backend nginx frontend
```

## Main Backfill

### 5. Run the full backfill

For a clean rebuild:

```bash
make backfill_taxon_name_parents ARGS="--write --commit-every 100 --log-every 1000 --read-batch-size 1000"
```

For an environment that already has valid parent rows and only needs refresh logic:

```bash
make backfill_taxon_name_parents ARGS="--write --skip-populated --commit-every 100 --log-every 1000 --read-batch-size 1000"
```

Expected output includes:

- startup mode line
- periodic `Progress: ...`
- `Committed batch of ... writes.`
- final `Backfill summary`

### 6. Record the final summary

Capture:

- `Processed`
- `Created parent rows`
- `Skipped populated names`
- `Skipped self-only matches`
- `Skipped ambiguous matches`
- `Failed rows`

These numbers are useful for comparing:

- local
- staging
- production

## Follow-Up Backfills

If the full run succeeds but you need to revisit unresolved records only:

```bash
make backfill_taxon_name_parents ARGS="--write --skip-populated --only-unresolved --commit-every 100 --log-every 500 --read-batch-size 250"
```

If you want to target particular unresolved statuses:

```bash
make backfill_taxon_name_parents ARGS="--write --skip-populated --only-status ambiguous,unmatched --commit-every 100 --log-every 500 --read-batch-size 250"
```

Notes:

- `--only-unresolved` will not touch rows already approved as `resolved`
- `--read-batch-size 250` is the safer operational value for reruns

## Staging Validation Checklist

After the backfill completes, validate the following in staging.

### Parent Review Queue

Check:

- `Parent Review Queue` loads
- `resolved` rows are hidden by default
- kingdom filter works
- hierarchy filter works
- bulk approve still works
- counts update correctly when filters change

### Taxon Name Screens

Check on show and edit:

- `Derived scientific name` appears in the summary row
- `Parallel name engine preview` appears above `Parent names`
- the preview has blue callout styling
- success badges are green
- the old temporary migration panels are gone

### Parallel Fields

Check:

- parallel name fields are seeded
- `Parallel uninomial` shows the parent-derived badge when no override is needed
- `Override` reveals the input
- `Use parent` restores parent mode without losing the unsaved typed value before save
- clearing a parallel field and saving does not repopulate stale data

### Name Logic Spot Checks

Use a few representative examples:

- standard single-parent match
- hybrid/intergrade example
- Animalia infrageneric example
- higher-rank infrageneric example
- no-parent fallback example

For each, check:

- current scientific name
- derived scientific name
- current canonical name
- derived canonical name

### Parallel Name Review

Check:

- the page loads under Administration
- it can review `taxon_names` across the whole database page by page
- `Only show non-matches on this page` behaves correctly

## Staging Sign-Off

Before production, capture:

- final backfill summary
- unresolved review count
- any known edge cases
- herbarium feedback on hybrid logic
- whether any further rule changes are required

Recommended decision point:

- do not proceed to production until the herbarium discussion confirms the parent
  and parallel-name logic is acceptable

## Production Rollout

Once staging is approved, repeat the same sequence on production.

Recommended order:

1. confirm fresh production backup
2. deploy the approved code
3. run `make upgrade`
4. restart services
5. decide whether production needs:
   - a clean rebuild from scratch
   - or an in-place refresh with `--skip-populated`
6. run the full backfill
7. validate the review queue and key taxon pages

## Production Safety Notes

- Prefer running the full backfill during a quieter operational window.
- Keep the first production run conservative if there is any uncertainty.
- Capture the final summary immediately after the run.
- Do not start repeated unresolved reruns until the first production results are reviewed.

## Recommended Commands Summary

### Migrate

```bash
make upgrade
docker compose restart backend nginx frontend
```

### Clean rebuild

```bash
docker compose run --rm backend python - <<'PY'
import app.model  # noqa: F401
from app.db.session import get_db
from app.db.taxon_name_parent.model import TaxonNameParent
from app.db.taxon_name_parent_review.model import TaxonNameParentReview

db = get_db().__next__()
try:
    db.query(TaxonNameParent).delete(synchronize_session=False)
    db.query(TaxonNameParentReview).delete(synchronize_session=False)
    db.commit()
finally:
    db.close()
PY
```

### Full backfill

```bash
make backfill_taxon_name_parents ARGS="--write --commit-every 100 --log-every 1000 --read-batch-size 1000"
```

### Safe unresolved rerun

```bash
make backfill_taxon_name_parents ARGS="--write --skip-populated --only-unresolved --commit-every 100 --log-every 500 --read-batch-size 250"
```

## Related Notes

- [Hybrid Parent Model Proposal](./hybrid-parent-model.md)
- [Parallel Name Engine Proposal](./parallel-name-engine-proposal.md)
- [Parent Name Change Propagation Proposal](./parent-name-change-propagation.md)
