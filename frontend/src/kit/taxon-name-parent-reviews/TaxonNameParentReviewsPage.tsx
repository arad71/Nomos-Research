import * as React from 'react';
import { Check, ExternalLink, Search, X } from 'lucide-react';
import { useDataTableCallbacksContext, useDataTableSelectedIdsContext } from 'ra-core';
import { CanAccess, useDataProvider, useNotify } from 'react-admin';
import { Link, useSearchParams } from 'react-router-dom';
import { DataTable } from '@/components/admin/data-table';
import { Spinner } from '@/components/admin/spinner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

type SortOrder = 'ASC' | 'DESC';

type TaxonNameParentReviewRecord = {
  id: number;
  taxon_name_parent_review_id?: number;
  taxon_name_id?: number;
  created_by?: number;
  created_on?: string | null;
  status?: string;
  reason?: string | null;
  updated_by?: number;
  updated_on?: string | null;
  legacy_uninomial?: string | null;
  derived_uninomial?: string | null;
  candidate_parent_ids?: string | null;
  candidate_parent_names?: string | null;
  parent_count?: number | null;
  hybrid_category?: string | null;
  hierarchy_confirmed?: boolean | null;
  hierarchy_confirmation_note?: string | null;
  has_hierarchy_rows?: boolean | null;
  infrageneric_confirmed?: boolean | null;
  infrageneric_confirmation_note?: string | null;
  review_notes?: string | null;
  reviewed_by?: number | null;
  reviewed_on?: string | null;
  deleted?: boolean;
  taxon_name?: {
    taxon_name_id?: number;
    scientific_name?: string | null;
    formatted_scientific_name?: string | null;
    is_current?: boolean | null;
    taxon_rank?: {
      rank_name?: string | null;
    } | null;
    kingdom?: {
      kingdom_name?: string | null;
    } | null;
  } | null;
};

type ReviewFilters = {
  q: string;
  status: string;
  reason: string;
  kingdom: string;
  hasHierarchyRows: string;
  showResolved: boolean;
};

type ReviewsResponse = {
  data: TaxonNameParentReviewRecord[];
  total: number;
};

type KingdomOption = {
  id: number | string;
  kingdom_name?: string | null;
};

type ColumnKey =
  | 'taxonName'
  | 'isCurrent'
  | 'kingdom'
  | 'status'
  | 'rank'
  | 'reason'
  | 'hasHierarchyRows'
  | 'legacyUninomial'
  | 'derivedUninomial'
  | 'parentCount'
  | 'hybridCategory'
  | 'hierarchy'
  | 'infrageneric'
  | 'candidateParents'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100, 250, 500, 1000] as const;
const TABLE_STORE_KEY = 'taxon_name_parent_reviews.kit.datatable';
const DEFAULT_SORT_FIELD = 'updated_on';
const DEFAULT_SORT_ORDER: SortOrder = 'DESC';

const defaultColumns: ColumnKey[] = [
  'kingdom',
  'rank',
  'taxonName',
  'isCurrent',
  'hasHierarchyRows',
  'status',
  'reason',
  'hierarchy',
  'infrageneric',
  'legacyUninomial',
  'derivedUninomial',
  'actions',
];

const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'kingdom', label: 'Kingdom' },
  { key: 'rank', label: 'Rank' },
  { key: 'taxonName', label: 'Taxon name' },
  { key: 'isCurrent', label: 'Is current' },
  { key: 'hasHierarchyRows', label: 'Has hierarchy' },
  { key: 'status', label: 'Status' },
  { key: 'reason', label: 'Reason' },
  { key: 'legacyUninomial', label: 'Legacy uninomial' },
  { key: 'derivedUninomial', label: 'Derived uninomial' },
  { key: 'parentCount', label: 'Parent count' },
  { key: 'hybridCategory', label: 'Hybrid category' },
  { key: 'hierarchy', label: 'Hierarchy confirmation' },
  { key: 'infrageneric', label: 'Infrageneric confirmation' },
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
  isCurrent: 'taxon_name___is_current',
  kingdom: 'taxon_name___kingdom___kingdom_name',
  status: 'status',
  rank: 'taxon_name___taxon_rank___rank_name',
  reason: 'reason',
  hasHierarchyRows: 'has_hierarchy_rows',
  legacyUninomial: 'legacy_uninomial',
  derivedUninomial: 'derived_uninomial',
  parentCount: 'parent_count',
  hybridCategory: 'hybrid_category',
  hierarchy: 'hierarchy_confirmed',
  infrageneric: 'infrageneric_confirmed',
};

const getColumnSource = (column: ColumnKey) => sortableColumns[column] ?? column;
const defaultHiddenColumns = columnOptions
  .map((column) => column.key)
  .filter((key) => !defaultColumns.includes(key))
  .map(getColumnSource);

const buildFilterObject = (filters: ReviewFilters) => {
  const nextFilter: Record<string, string | string[]> = {};

  if (filters.q) nextFilter.q = filters.q;
  if (filters.status) {
    nextFilter.status = filters.status;
  } else if (!filters.showResolved) {
    nextFilter.status = ['matched_needs_review', 'mismatch', 'ambiguous', 'unmatched', 'ignored'];
  }
  if (filters.reason) nextFilter.reason = filters.reason;
  if (filters.kingdom) nextFilter['taxon_name___kingdom___kingdom_name'] = filters.kingdom;
  if (filters.hasHierarchyRows === 'true') nextFilter.has_hierarchy_rows = true;
  if (filters.hasHierarchyRows === 'false') nextFilter.has_hierarchy_rows = false;

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

const HtmlValue = ({ value }: { value?: string | null }) =>
  value ? <span dangerouslySetInnerHTML={{ __html: value }} /> : null;

const toUpdatePayload = (
  record: TaxonNameParentReviewRecord,
  status: 'resolved' | 'ignored'
) => ({
  taxon_name_id: record.taxon_name_id ?? record.taxon_name?.taxon_name_id ?? 0,
  created_by: record.created_by ?? 0,
  created_on: record.created_on ?? null,
  status,
  reason: record.reason ?? null,
  updated_by: record.updated_by ?? record.created_by ?? 0,
  updated_on: record.updated_on ?? null,
  legacy_uninomial: record.legacy_uninomial ?? null,
  derived_uninomial: record.derived_uninomial ?? null,
  candidate_parent_ids: record.candidate_parent_ids ?? null,
  candidate_parent_names: record.candidate_parent_names ?? null,
  parent_count: record.parent_count ?? null,
  hybrid_category: record.hybrid_category ?? null,
  hierarchy_confirmed: record.hierarchy_confirmed ?? null,
  hierarchy_confirmation_note: record.hierarchy_confirmation_note ?? null,
  infrageneric_confirmed: record.infrageneric_confirmed ?? null,
  infrageneric_confirmation_note: record.infrageneric_confirmation_note ?? null,
  has_hierarchy_rows: record.has_hierarchy_rows ?? null,
  review_notes: record.review_notes ?? null,
  reviewed_by: record.reviewed_by ?? null,
  reviewed_on: record.reviewed_on ?? null,
});

const ReviewQueueBulkActionsToolbar = ({
  records,
  onUpdated,
}: {
  records: TaxonNameParentReviewRecord[];
  onUpdated: () => Promise<void>;
}) => {
  const selectedIds = useDataTableSelectedIdsContext() ?? [];
  const { onSelect } = useDataTableCallbacksContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [isApproving, setIsApproving] = React.useState(false);

  const clearSelection = React.useCallback(() => {
    onSelect?.([]);
  }, [onSelect]);

  const selectedRecords = React.useMemo(
    () => records.filter((record) => selectedIds.includes(record.id)),
    [records, selectedIds]
  );
  const approvableRecords = React.useMemo(
    () => selectedRecords.filter((record) => record.status === 'matched_needs_review'),
    [selectedRecords]
  );

  const handleApproveSelected = React.useCallback(async () => {
    if (!approvableRecords.length || isApproving) {
      return;
    }

    try {
      setIsApproving(true);
      await Promise.all(
        approvableRecords.map((record) =>
          dataProvider.update('taxon_name_parent_reviews', {
            id: record.id ?? record.taxon_name_parent_review_id ?? 0,
            data: toUpdatePayload(record, 'resolved'),
            previousData: record,
          })
        )
      );

      const skippedCount = selectedRecords.length - approvableRecords.length;
      notify(
        skippedCount > 0
          ? `Approved ${approvableRecords.length} review row${approvableRecords.length === 1 ? '' : 's'} and skipped ${skippedCount} non-review row${skippedCount === 1 ? '' : 's'}`
          : `Approved ${approvableRecords.length} review row${approvableRecords.length === 1 ? '' : 's'}`,
        { type: 'success' }
      );
      clearSelection();
      await onUpdated();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Failed to approve selected review rows',
        { type: 'error' }
      );
    } finally {
      setIsApproving(false);
    }
  }, [approvableRecords, clearSelection, dataProvider, isApproving, notify, onUpdated, selectedRecords.length]);

  if (!selectedIds.length) {
    return null;
  }

  return (
    <Card className="fixed bottom-3 left-1/2 z-10 flex w-[min(92vw,34rem)] -translate-x-1/2 items-center justify-between gap-3 border-border bg-background px-4 py-3 shadow-lg">
      <div className="text-sm text-muted-foreground">
        {selectedIds.length} selected
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clearSelection}>
          Clear
        </Button>
        <CanAccess resource="taxon_name_parent_reviews" action="edit">
          <Button
            type="button"
            size="sm"
            onClick={() => void handleApproveSelected()}
            disabled={!approvableRecords.length || isApproving}
          >
            <Check className="h-4 w-4" />
            {isApproving ? 'Approving...' : 'Approve selected'}
          </Button>
        </CanAccess>
      </div>
    </Card>
  );
};

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
      kingdom: searchParams.get('kingdom') ?? '',
      hasHierarchyRows: searchParams.get('hasHierarchyRows') ?? '',
      showResolved: searchParams.get('showResolved') === 'true',
    }),
    [searchParams]
  );

  const [formFilters, setFormFilters] = React.useState<ReviewFilters>(filters);
  const [state, setState] = React.useState<ReviewsResponse>({
    data: [],
    total: 0,
  });
  const [kingdomOptions, setKingdomOptions] = React.useState<KingdomOption[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Array<number | string>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mutatingId, setMutatingId] = React.useState<number | null>(null);

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }
    return 'Failed to update review row';
  };

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
    let active = true;

    dataProvider
      .getList('kingdoms', {
        pagination: { page: 1, perPage: 200 },
        sort: { field: 'kingdom_name', order: 'ASC' },
        filter: {},
      })
      .then((response) => {
        if (!active) {
          return;
        }
        setKingdomOptions((response.data as KingdomOption[]) ?? []);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setKingdomOptions([]);
      });

    return () => {
      active = false;
    };
  }, [dataProvider]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  React.useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => state.data.some((record) => record.id === id))
    );
  }, [state.data]);

  const totalPages = Math.max(1, Math.ceil(state.total / perPage));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      q: formFilters.q,
      status: formFilters.status,
      reason: formFilters.reason,
      kingdom: formFilters.kingdom,
      hasHierarchyRows: formFilters.hasHierarchyRows,
      showResolved: formFilters.showResolved ? 'true' : null,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setFormFilters({ q: '', status: '', reason: '', kingdom: '', hasHierarchyRows: '', showResolved: false });
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
      notify(getErrorMessage(updateError), { type: 'error' });
    } finally {
      setMutatingId(null);
    }
  };

  const renderCellContent = (column: ColumnKey, record: TaxonNameParentReviewRecord) => {
    switch (column) {
      case 'taxonName': {
        const taxonNameId = record.taxon_name?.taxon_name_id ?? record.taxon_name_id;
        const formattedName = record.taxon_name?.formatted_scientific_name;
        const plainLabel = record.taxon_name?.scientific_name || `Taxon ${taxonNameId ?? 'unknown'}`;
        if (!taxonNameId) {
          return formattedName ? (
            <HtmlValue value={formattedName} />
          ) : (
            <span className="text-sm text-muted-foreground">{plainLabel}</span>
          );
        }
        return (
          <Link to={`/taxon_names/${taxonNameId}`} className="font-medium text-primary hover:underline">
            {formattedName ? <HtmlValue value={formattedName} /> : plainLabel}
          </Link>
        );
      }
      case 'status':
        return <Badge variant={statusVariant(record.status)}>{formatTitle(record.status)}</Badge>;
      case 'isCurrent':
        if (record.taxon_name?.is_current === true) {
          return <Badge>Yes</Badge>;
        }
        if (record.taxon_name?.is_current === false) {
          return <Badge variant="outline">No</Badge>;
        }
        return <span className="text-sm text-muted-foreground">Not set</span>;
      case 'hasHierarchyRows':
        if (record.has_hierarchy_rows === true) {
          return <Badge>Yes</Badge>;
        }
        if (record.has_hierarchy_rows === false) {
          return <Badge variant="outline">No</Badge>;
        }
        return <span className="text-sm text-muted-foreground">Not set</span>;
      case 'kingdom':
        return (
          <span className="text-sm text-muted-foreground">
            {record.taxon_name?.kingdom?.kingdom_name || 'Not set'}
          </span>
        );
      case 'rank':
        return (
          <span className="text-sm text-muted-foreground">
            {record.taxon_name?.taxon_rank?.rank_name || 'Not set'}
          </span>
        );
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
      case 'hierarchy':
        if (record.hierarchy_confirmed === true) {
          return (
            <div className="space-y-1">
              <Badge>Confirmed</Badge>
              {record.hierarchy_confirmation_note ? (
                <div className="text-xs text-muted-foreground">
                  {record.hierarchy_confirmation_note}
                </div>
              ) : null}
            </div>
          );
        }
        if (record.hierarchy_confirmed === false) {
          return (
            <div className="space-y-1">
              <Badge variant="destructive">Not confirmed</Badge>
              {record.hierarchy_confirmation_note ? (
                <div className="text-xs text-muted-foreground">
                  {record.hierarchy_confirmation_note}
                </div>
              ) : null}
            </div>
          );
        }
        return (
          <span className="text-sm text-muted-foreground">
            {record.hierarchy_confirmation_note || 'No hierarchy evidence'}
          </span>
        );
      case 'infrageneric':
        if (record.infrageneric_confirmed === true) {
          return (
            <div className="space-y-1">
              <Badge>Confirmed</Badge>
              {record.infrageneric_confirmation_note ? (
                <div className="text-xs text-muted-foreground">
                  {record.infrageneric_confirmation_note}
                </div>
              ) : null}
            </div>
          );
        }
        if (record.infrageneric_confirmed === false) {
          return (
            <div className="space-y-1">
              <Badge variant="destructive">Not confirmed</Badge>
              {record.infrageneric_confirmation_note ? (
                <div className="text-xs text-muted-foreground">
                  {record.infrageneric_confirmation_note}
                </div>
              ) : null}
            </div>
          );
        }
        return (
          <span className="text-sm text-muted-foreground">
            {record.infrageneric_confirmation_note || 'No infrageneric evidence'}
          </span>
        );
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
          <div className="grid gap-4 md:grid-cols-5">
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
            <label className="space-y-2 text-sm font-medium text-foreground">
              Kingdom
              <select
                value={formFilters.kingdom}
                onChange={(event) =>
                  setFormFilters((current) => ({ ...current, kingdom: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any kingdom</option>
                {kingdomOptions.map((kingdom) => (
                  <option key={kingdom.id} value={kingdom.kingdom_name ?? ''}>
                    {kingdom.kingdom_name ?? 'Unknown kingdom'}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Has hierarchy
              <select
                value={formFilters.hasHierarchyRows}
                onChange={(event) =>
                  setFormFilters((current) => ({ ...current, hasHierarchyRows: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={formFilters.showResolved}
              onChange={(event) =>
                setFormFilters((current) => ({
                  ...current,
                  showResolved: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            Show resolved
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Apply filters</Button>
            <Button type="button" variant="outline" onClick={clearAllFilters}>
              Reset
            </Button>
            <Badge variant="outline" className="self-center">
              {loading ? 'Loading...' : `${state.total} result${state.total === 1 ? '' : 's'}`}
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

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            <Spinner size="sm" />
            <span>Loading review rows...</span>
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
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
            onToggleItem={(id) =>
              setSelectedIds((current) =>
                current.includes(id)
                  ? current.filter((selectedId) => selectedId !== id)
                  : [...current, id]
              )
            }
            bulkActionButtons={false}
            bulkActionsToolbar={
              <ReviewQueueBulkActionsToolbar
                records={state.data}
                onUpdated={loadRows}
              />
            }
          >
            {columnOptions.map((column) => (
              <DataTable.Col<TaxonNameParentReviewRecord>
                key={column.key}
                source={getColumnSource(column.key)}
                label={columnLabelMap[column.key]}
                disableSort={!sortableColumns[column.key]}
                headerClassName={column.key === 'actions' ? 'text-right' : undefined}
                cellClassName={
                  column.key === 'actions'
                    ? 'align-top'
                    : column.key === 'hierarchy' || column.key === 'infrageneric'
                      ? 'align-top whitespace-normal'
                      : undefined
                }
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
