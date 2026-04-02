import * as React from 'react';
import { Check, ExternalLink, Search, X } from 'lucide-react';
import { CanAccess, useDataProvider, useNotify } from 'react-admin';
import { Link, useSearchParams } from 'react-router-dom';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

type SortOrder = 'ASC' | 'DESC';

type TaxonNameParentReviewRecord = {
  id: number;
  taxon_name_parent_review_id?: number;
  taxon_name_id?: number;
  status?: string;
  reason?: string | null;
  legacy_uninomial?: string | null;
  derived_uninomial?: string | null;
  candidate_parent_ids?: string | null;
  candidate_parent_names?: string | null;
  parent_count?: number | null;
  hybrid_category?: string | null;
  review_notes?: string | null;
  reviewed_by?: number | null;
  reviewed_on?: string | null;
  deleted?: boolean;
  taxon_name?: {
    taxon_name_id?: number;
    scientific_name?: string | null;
    formatted_scientific_name?: string | null;
  } | null;
};

type ReviewFilters = {
  q: string;
  status: string;
  reason: string;
};

type ReviewsResponse = {
  data: TaxonNameParentReviewRecord[];
  total: number;
};

type ColumnKey =
  | 'taxonName'
  | 'status'
  | 'reason'
  | 'legacyUninomial'
  | 'derivedUninomial'
  | 'parentCount'
  | 'hybridCategory'
  | 'candidateParents'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'taxon_name_parent_reviews.kit.datatable';
const DEFAULT_SORT_FIELD = 'updated_on';
const DEFAULT_SORT_ORDER: SortOrder = 'DESC';

const defaultColumns: ColumnKey[] = [
  'taxonName',
  'status',
  'reason',
  'legacyUninomial',
  'derivedUninomial',
  'actions',
];

const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'taxonName', label: 'Taxon name' },
  { key: 'status', label: 'Status' },
  { key: 'reason', label: 'Reason' },
  { key: 'legacyUninomial', label: 'Legacy uninomial' },
  { key: 'derivedUninomial', label: 'Derived uninomial' },
  { key: 'parentCount', label: 'Parent count' },
  { key: 'hybridCategory', label: 'Hybrid category' },
  { key: 'candidateParents', label: 'Candidate parents' },
  { key: 'actions', label: 'Actions' },
];

const columnLabelMap = columnOptions.reduce<Record<ColumnKey, string>>(
  (acc, column) => {
    acc[column.key] = column.label;
    return acc;
  },
  {} as Record<ColumnKey, string>
);

const sortableColumns: Partial<Record<ColumnKey, string>> = {
  taxonName: 'taxon_name___scientific_name',
  status: 'status',
  reason: 'reason',
  legacyUninomial: 'legacy_uninomial',
  derivedUninomial: 'derived_uninomial',
  parentCount: 'parent_count',
  hybridCategory: 'hybrid_category',
};

const getColumnSource = (column: ColumnKey) => sortableColumns[column] ?? column;
const defaultHiddenColumns = columnOptions
  .map((column) => column.key)
  .filter((key) => !defaultColumns.includes(key))
  .map(getColumnSource);

const buildFilterObject = (filters: ReviewFilters) => {
  const nextFilter: Record<string, string> = {};

  if (filters.q) nextFilter.q = filters.q;
  if (filters.status) nextFilter.status = filters.status;
  if (filters.reason) nextFilter.reason = filters.reason;

  return nextFilter;
};

const formatTitle = (value?: string | null) => {
  if (!value) {
    return 'Not set';
  }
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const statusVariant = (status?: string | null) => {
  switch (status) {
    case 'mismatch':
    case 'ambiguous':
    case 'unmatched':
      return 'destructive' as const;
    case 'resolved':
      return 'default' as const;
    default:
      return 'outline' as const;
  }
};

const toUpdatePayload = (
  record: TaxonNameParentReviewRecord,
  status: 'resolved' | 'ignored'
) => ({
  taxon_name_id: record.taxon_name_id ?? record.taxon_name?.taxon_name_id ?? 0,
  status,
  reason: record.reason ?? null,
  legacy_uninomial: record.legacy_uninomial ?? null,
  derived_uninomial: record.derived_uninomial ?? null,
  candidate_parent_ids: record.candidate_parent_ids ?? null,
  candidate_parent_names: record.candidate_parent_names ?? null,
  parent_count: record.parent_count ?? null,
  hybrid_category: record.hybrid_category ?? null,
  review_notes: record.review_notes ?? null,
  reviewed_by: record.reviewed_by ?? null,
  reviewed_on: record.reviewed_on ?? null,
});

const TaxonNameParentReviewsPage = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const perPage = Math.max(
    1,
    Number(searchParams.get('perPage') ?? String(DEFAULT_PER_PAGE)) || DEFAULT_PER_PAGE
  );
  const sortField = searchParams.get('sortField') ?? DEFAULT_SORT_FIELD;
  const sortOrder = (searchParams.get('sortOrder') as SortOrder | null) ?? DEFAULT_SORT_ORDER;
  const filters = React.useMemo<ReviewFilters>(
    () => ({
      q: searchParams.get('q') ?? '',
      status: searchParams.get('status') ?? '',
      reason: searchParams.get('reason') ?? '',
    }),
    [searchParams]
  );

  const [formFilters, setFormFilters] = React.useState<ReviewFilters>(filters);
  const [state, setState] = React.useState<ReviewsResponse>({
    data: [],
    total: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mutatingId, setMutatingId] = React.useState<number | null>(null);

  const updateParams = React.useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const nextParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          nextParams.delete(key);
          return;
        }
        nextParams.set(key, String(value));
      });
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const loadRows = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataProvider.getList('taxon_name_parent_reviews', {
        pagination: { page, perPage },
        sort: { field: sortField, order: sortOrder },
        filter: buildFilterObject(filters),
      });
      setState({
        data: response.data as TaxonNameParentReviewRecord[],
        total: response.total ?? 0,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load parent review queue');
    } finally {
      setLoading(false);
    }
  }, [dataProvider, filters, page, perPage, sortField, sortOrder]);

  React.useEffect(() => {
    setFormFilters(filters);
  }, [filters]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const totalPages = Math.max(1, Math.ceil(state.total / perPage));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      q: formFilters.q,
      status: formFilters.status,
      reason: formFilters.reason,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setFormFilters({ q: '', status: '', reason: '' });
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const updateStatus = async (record: TaxonNameParentReviewRecord, status: 'resolved' | 'ignored') => {
    const reviewId = record.id ?? record.taxon_name_parent_review_id;
    if (!reviewId) {
      return;
    }

    setMutatingId(reviewId);
    try {
      await dataProvider.update('taxon_name_parent_reviews', {
        id: reviewId,
        data: toUpdatePayload(record, status),
        previousData: record,
      });
      notify(status === 'resolved' ? 'Marked as resolved' : 'Marked as ignored', {
        type: 'success',
      });
      await loadRows();
    } catch (updateError) {
      notify(
        updateError instanceof Error ? updateError.message : 'Failed to update review row',
        { type: 'error' }
      );
    } finally {
      setMutatingId(null);
    }
  };

  const renderCellContent = (column: ColumnKey, record: TaxonNameParentReviewRecord) => {
    switch (column) {
      case 'taxonName': {
        const taxonNameId = record.taxon_name?.taxon_name_id ?? record.taxon_name_id;
        const label =
          record.taxon_name?.formatted_scientific_name ||
          record.taxon_name?.scientific_name ||
          `Taxon ${taxonNameId ?? 'unknown'}`;
        if (!taxonNameId) {
          return <span className="text-sm text-muted-foreground">{label}</span>;
        }
        return (
          <Link to={`/taxon_names/${taxonNameId}`} className="font-medium text-primary hover:underline">
            {label}
          </Link>
        );
      }
      case 'status':
        return <Badge variant={statusVariant(record.status)}>{formatTitle(record.status)}</Badge>;
      case 'reason':
        return (
          <span className="text-sm text-muted-foreground">
            {formatTitle(record.reason)}
          </span>
        );
      case 'legacyUninomial':
        return record.legacy_uninomial || <span className="text-muted-foreground">Not set</span>;
      case 'derivedUninomial':
        return record.derived_uninomial || <span className="text-muted-foreground">Not set</span>;
      case 'parentCount':
        return String(record.parent_count ?? 0);
      case 'hybridCategory':
        return record.hybrid_category ? formatTitle(record.hybrid_category) : 'Not set';
      case 'candidateParents':
        return record.candidate_parent_names || <span className="text-muted-foreground">None</span>;
      case 'actions': {
        const taxonNameId = record.taxon_name?.taxon_name_id ?? record.taxon_name_id;
        const isBusy = mutatingId === (record.id ?? record.taxon_name_parent_review_id);
        return (
          <div className="flex flex-wrap justify-end gap-2">
            {taxonNameId ? (
              <Button asChild variant="outline" size="sm">
                <Link to={`/taxon_names/${taxonNameId}`}>
                  <ExternalLink className="h-4 w-4" />
                  Open taxon
                </Link>
              </Button>
            ) : null}
            <CanAccess resource="taxon_name_parent_reviews" action="edit">
              <Button
                type="button"
                size="sm"
                disabled={isBusy || record.status === 'resolved'}
                onClick={() => void updateStatus(record, 'resolved')}
              >
                <Check className="h-4 w-4" />
                Resolve
              </Button>
            </CanAccess>
            <CanAccess resource="taxon_name_parent_reviews" action="edit">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy || record.status === 'ignored'}
                onClick={() => void updateStatus(record, 'ignored')}
              >
                <X className="h-4 w-4" />
                Ignore
              </Button>
            </CanAccess>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Parent Review Queue</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Work through auto-matched, unmatched, ambiguous, and mismatch records created during the
          parent-link backfill.
        </p>
      </div>

      <Card className="rounded-3xl border border-border/80 p-5 shadow-sm">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm font-medium text-foreground">
              Search
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={formFilters.q}
                  onChange={(event) =>
                    setFormFilters((current) => ({ ...current, q: event.target.value }))
                  }
                  placeholder="Taxon, uninomial, candidates..."
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Status
              <select
                value={formFilters.status}
                onChange={(event) =>
                  setFormFilters((current) => ({ ...current, status: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any status</option>
                <option value="matched_needs_review">Matched needs review</option>
                <option value="mismatch">Mismatch</option>
                <option value="ambiguous">Ambiguous</option>
                <option value="unmatched">Unmatched</option>
                <option value="resolved">Resolved</option>
                <option value="ignored">Ignored</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Reason
              <select
                value={formFilters.reason}
                onChange={(event) =>
                  setFormFilters((current) => ({ ...current, reason: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any reason</option>
                <option value="existing_parent_links">Existing parent links</option>
                <option value="auto_matched_unique_uninomial">Auto-matched unique uninomial</option>
                <option value="multiple_candidate_parents">Multiple candidate parents</option>
                <option value="no_candidate_parent">No candidate parent</option>
                <option value="blank_uninomial">Blank uninomial</option>
                <option value="derived_name_mismatch">Derived name mismatch</option>
                <option value="missing_hybrid_category">Missing hybrid category</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Apply filters</Button>
            <Button type="button" variant="outline" onClick={clearAllFilters}>
              Reset
            </Button>
            <Badge variant="outline" className="self-center">
              {state.total} result{state.total === 1 ? '' : 's'}
            </Badge>
          </div>
        </form>
      </Card>

      <Card className="rounded-3xl border border-border/80 p-5 shadow-sm">
        {error ? (
          <div className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <DataTable<TaxonNameParentReviewRecord>
            resource="taxon_name_parent_reviews"
            storeKey={TABLE_STORE_KEY}
            hiddenColumns={defaultHiddenColumns}
            data={state.data}
            total={state.total}
            isPending={loading}
            isLoading={loading}
            rowClick={false}
            sort={{ field: sortField, order: sortOrder }}
            setSort={(sort) =>
              updateParams({ sortField: sort.field, sortOrder: sort.order as SortOrder, page: 1 })
            }
            bulkActionButtons={false}
          >
            {columnOptions.map((column) => (
              <DataTable.Col<TaxonNameParentReviewRecord>
                key={column.key}
                source={getColumnSource(column.key)}
                label={columnLabelMap[column.key]}
                disableSort={!sortableColumns[column.key]}
                headerClassName={column.key === 'actions' ? 'text-right' : undefined}
                cellClassName={column.key === 'actions' ? 'align-top' : undefined}
                render={(record) => renderCellContent(column.key, record)}
              />
            ))}
          </DataTable>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="taxon-name-parent-reviews-per-page"
                  className="text-sm text-muted-foreground"
                >
                  Rows
                </label>
                <select
                  id="taxon-name-parent-reviews-per-page"
                  value={perPage}
                  onChange={(event) => updateParams({ perPage: Number(event.target.value), page: 1 })}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => updateParams({ page: page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => updateParams({ page: page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaxonNameParentReviewsPage;
