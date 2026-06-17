# Taxon Publication Reference Backfill Runbook

## Purpose

`taxon_name.publication_id` is the legacy way to link a taxon name to a publication. The newer model stores publication references in `taxon_publication`.

This backfill creates a `taxon_publication` row for every active `taxon_name` that has a legacy `publication_id`, unless an active link for the same `(taxon_name_id, publication_id)` already exists.

The script is idempotent and safe to rerun.

## Script

Run from the repository root on the deployed host:

```bash
docker compose run --rm backend python app/tools/backfill_taxon_publications.py --dry-run
```

To persist changes after reviewing the dry run:

```bash
docker compose run --rm backend python app/tools/backfill_taxon_publications.py --write --user-id <admin_user_id>
```

If there is no appropriate audit user ID available, omit `--user-id`; the links will still be created, but `created_by` and `updated_by` will be empty.

## Recommended Deployment Process

1. Deploy the code containing `backend/app/tools/backfill_taxon_publications.py`.
2. Confirm database migrations have completed successfully.
3. Run the dry run:

   ```bash
   docker compose run --rm backend python app/tools/backfill_taxon_publications.py --dry-run
   ```

4. Review the final log line. It should report created, skipped, error, and inspected counts.
5. If the dry run looks correct, run the write:

   ```bash
   docker compose run --rm backend python app/tools/backfill_taxon_publications.py --write --user-id <admin_user_id>
   ```

6. Re-run the dry run after the write. A successful idempotency check should show the previously created links as skipped and no new links to create.

## Useful Options

```bash
--limit 100
```

Inspect only the first 100 matching taxon names. Useful for a small dry run.

```bash
--batch-size 500
```

Flush every 500 created links. The default is 1000.

```bash
--include-deleted-taxon-names
```

Include soft-deleted taxon names. Do not use this for the standard deployment pass unless specifically requested.

```bash
--no-recalculate
```

Skip taxon-name derived-field recalculation. The default is to recalculate after creating each link.

## Validation Queries

Run these against the target database before and after the write.

Count active taxon names with legacy publication links:

```sql
select count(*)
from taxon_name
where deleted = false
  and publication_id is not null;
```

Count active legacy links that still do not have a matching active publication reference:

```sql
select count(*)
from taxon_name tn
where tn.deleted = false
  and tn.publication_id is not null
  and not exists (
    select 1
    from taxon_publication tp
    where tp.deleted = false
      and tp.taxon_name_id = tn.taxon_name_id
      and tp.publication_id = tn.publication_id
  );
```

After the backfill, the second query should return `0`.

## Rollback

There is no automatic rollback command. If the script creates incorrect links, soft-delete only the rows created by this deployment pass.

When `--user-id <admin_user_id>` was supplied, use that value plus the deployment timestamp window to identify created rows:

```sql
update taxon_publication
set deleted = true
where created_by = <admin_user_id>
  and created_on >= '<deployment_start_timestamp>';
```

If `--user-id` was omitted, identify rows by the deployment timestamp window and confirm the selection before updating:

```sql
select taxon_publication_id, taxon_name_id, publication_id, created_on
from taxon_publication
where created_on >= '<deployment_start_timestamp>'
order by taxon_publication_id;
```

## Notes

- The script only creates missing active links; it does not remove or modify existing publication references.
- Existing soft-deleted `taxon_publication` rows are not restored. A new active link will be created if only a deleted link exists.
- The database has a partial unique index on active `(taxon_name_id, publication_id)` links, which protects against duplicate active references.
