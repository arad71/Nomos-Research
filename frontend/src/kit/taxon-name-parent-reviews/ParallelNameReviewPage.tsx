import * as React from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { useDataProvider } from 'ra-core';
import { useNotify } from 'react-admin';
import { Link, useSearchParams } from 'react-router-dom';
import { BACKEND_URL } from '../../config';
import { DataTable } from '@/components/admin/data-table';
import { Spinner } from '@/components/admin/spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type SortOrder = 'ASC' | 'DESC';

type ReviewRecord = {
  id: number;
  taxon_name_id?: number;
  scientific_name?: string | null;
  formatted_scientific_name?: string | null;
  canonical_name?: string | null;
  uninomial?: string | null;
  parallel_override_uninomial?: string | null;
  is_current?: boolean | null;
  taxon_rank?: {
    rank_name?: string | null;
  } | string | null;
  kingdom?: {
    kingdom_name?: string | null;
  } | string | null;
  audit_strategy?: string | null;
  audit_mismatch_kind?: string | null;
  audit_current_scientific_name?: string | null;
  audit_derived_scientific_name?: string | null;
  audit_current_canonical_name?: string | null;
  audit_derived_canonical_name?: string | null;
};

type ParallelPreview = {
  id?: string | number;
  taxon_name_id?: string | number;
  strategy?: string | null;
  parent_taxon_name_ids?: Array<string | number> | null;
  current_canonical_name?: string | null;
  current_scientific_name?: string | null;
  current_formatted_scientific_name?: string | null;
  derived_canonical_name?: string | null;
  derived_scientific_name?: string | null;
  derived_formatted_scientific_name?: string | null;
  matches_current_uninomial?: boolean;
  matches_current_scientific_name?: boolean;
};

type ParallelAuditMismatch = {
  taxon_name_id: number;
  mismatch_kind: string;
  strategy: string;
  current_scientific_name?: string | null;
  derived_scientific_name?: string | null;
  current_canonical_name?: string | null;
  derived_canonical_name?: string | null;
};

type ParallelAuditResult = {
  strict: boolean;
  current_only: boolean;
  processed: number;
  matches_all: number;
  scientific_mismatch: number;
  author_only_scientific_mismatch: number;
  canonical_mismatch: number;
  both_mismatch: number;
  errors: number;
  mismatch_rows: ParallelAuditMismatch[];
};

type ParallelAuditJobStatus = {
  status: 'idle' | 'running' | 'completed' | 'failed';
  strict: boolean;
  current_only: boolean;
  batch_size: number;
  mismatch_limit: number;
  expected_total: number;
  processed: number;
  matches_all: number;
  scientific_mismatch: number;
  author_only_scientific_mismatch: number;
  canonical_mismatch: number;
  both_mismatch: number;
  errors: number;
  started_at?: string | null;
  finished_at?: string | null;
  error_message?: string | null;
  result?: ParallelAuditResult | null;
};

type StoredParallelAuditRun = {
  runAt: string;
  result: ParallelAuditResult;
};

type Filters = {
  q: string;
  kingdom: string;
  rank: string;
  parallelUninomialOverride: string;
  hasParentLink: string;
  currentOnly: boolean;
  onlyMismatches: boolean;
};

type ResponseState = {
  data: ReviewRecord[];
  total: number;
};

type ColumnKey =
  | 'taxonName'
  | 'kingdom'
  | 'rank'
  | 'isCurrent'
  | 'strategy'
  | 'comparison'
  | 'currentScientific'
  | 'derivedScientific'
  | 'currentCanonical'
  | 'derivedCanonical'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [25, 50, 100] as const;
const DEFAULT_SORT_FIELD = 'updated_on';
const DEFAULT_SORT_ORDER: SortOrder = 'DESC';
const TABLE_STORE_KEY = 'parallel_name_review.kit.datatable';
const AUDIT_RESULT_STORAGE_KEY = 'parallel_name_review.last_full_audit';

const readStoredAuditRun = (): StoredParallelAuditRun | null => {
  try {
    const raw = localStorage.getItem(AUDIT_RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredParallelAuditRun;
    if (!parsed?.result || !Array.isArray(parsed.result.mismatch_rows)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const runAuditRequestWithFallback = async (
  token: string | null,
  method: 'GET' | 'POST',
  pathSuffixes: string[],
): Promise<Response> => {
  let lastStatus: number | null = null;
  for (const suffix of pathSuffixes) {
    const response = await fetch(`${BACKEND_URL}${suffix}`, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) return response;
    lastStatus = response.status;
    if (![404, 405].includes(response.status)) return response;
  }
  throw new Error(`Audit request failed (${lastStatus ?? 'unknown'})`);
};

const defaultColumns: ColumnKey[] = [
  'kingdom',
  'rank',
  'taxonName',
  'isCurrent',
  'comparison',
  'strategy',
  'currentScientific',
  'derivedScientific',
  'currentCanonical',
  'derivedCanonical',
  'actions',
];

const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'kingdom', label: 'Kingdom' },
  { key: 'rank', label: 'Rank' },
  { key: 'taxonName', label: 'Taxon name' },
  { key: 'isCurrent', label: 'Is current' },
  { key: 'comparison', label: 'Comparison' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'currentScientific', label: 'Current scientific name' },
  { key: 'derivedScientific', label: 'Derived scientific name' },
  { key: 'currentCanonical', label: 'Current canonical name' },
  { key: 'derivedCanonical', label: 'Derived canonical name' },
  { key: 'actions', label: 'Actions' },
];

const columnLabelMap = columnOptions.reduce<Record<ColumnKey, string>>((acc, column) => {
  acc[column.key] = column.label;
  return acc;
}, {} as Record<ColumnKey, string>);

const sortableColumns: Partial<Record<ColumnKey, string>> = {
  kingdom: 'kingdom___kingdom_name',
  rank: 'taxon_rank___rank_name',
  taxonName: 'scientific_name',
  isCurrent: 'is_current',
};

const getColumnSource = (column: ColumnKey) => sortableColumns[column] ?? column;
const defaultHiddenColumns = columnOptions
  .map((column) => column.key)
  .filter((key) => !defaultColumns.includes(key))
  .map(getColumnSource);

const HtmlValue = ({ value }: { value?: string | null }) =>
  value ? <span dangerouslySetInnerHTML={{ __html: value }} /> : null;

const formatTitle = (value?: string | null) => {
  if (!value) return 'Not set';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const buildFilterObject = (filters: Filters) => {
  const next: Record<string, string> = {};
  if (filters.q) next.q = filters.q;
  if (filters.kingdom) next['kingdom___kingdom_name'] = filters.kingdom;
  if (filters.rank) next['taxon_rank___rank_name'] = filters.rank;
  if (filters.currentOnly) next.is_current = 'true';
  return next;
};

const ParallelNameReviewPage = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const perPage = Math.max(1, Number(searchParams.get('perPage') ?? String(DEFAULT_PER_PAGE)) || DEFAULT_PER_PAGE);
  const sortField = searchParams.get('sortField') ?? DEFAULT_SORT_FIELD;
  const sortOrder = (searchParams.get('sortOrder') as SortOrder | null) ?? DEFAULT_SORT_ORDER;

  const filters = React.useMemo<Filters>(
    () => ({
      q: searchParams.get('q') ?? '',
      kingdom: searchParams.get('kingdom') ?? '',
      rank: searchParams.get('rank') ?? '',
      parallelUninomialOverride: searchParams.get('parallelUninomialOverride') ?? '',
      hasParentLink: searchParams.get('hasParentLink') ?? '',
      currentOnly: searchParams.get('currentOnly') === 'true',
      onlyMismatches: searchParams.get('onlyMismatches') !== 'false',
    }),
    [searchParams],
  );

  const [formFilters, setFormFilters] = React.useState<Filters>(filters);
  const [state, setState] = React.useState<ResponseState>({ data: [], total: 0 });
  const [previewByTaxonId, setPreviewByTaxonId] = React.useState<Record<string, ParallelPreview>>({});
  const [loading, setLoading] = React.useState(true);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [auditRunning, setAuditRunning] = React.useState(false);
  const [lastAuditRun, setLastAuditRun] = React.useState<StoredParallelAuditRun | null>(() => readStoredAuditRun());
  const [auditError, setAuditError] = React.useState<string | null>(null);
  const [auditJobStatus, setAuditJobStatus] = React.useState<ParallelAuditJobStatus | null>(null);
  const [auditPanelCollapsed, setAuditPanelCollapsed] = React.useState(true);

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
    [searchParams, setSearchParams],
  );

  const loadRows = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataProvider.getList('taxon_names', {
        pagination: { page, perPage },
        sort: { field: sortField, order: sortOrder },
        filter: buildFilterObject(filters),
      });
      setState({
        data: response.data as ReviewRecord[],
        total: response.total ?? 0,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load parallel name review rows');
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

  React.useEffect(() => {
    let active = true;
    const taxonIds = state.data
      .map((record) => record.taxon_name_id ?? record.id)
      .filter((value): value is number => typeof value === 'number');

    if (!taxonIds.length) {
      setPreviewByTaxonId({});
      return () => {
        active = false;
      };
    }

    setPreviewLoading(true);
    Promise.all(
      taxonIds.map(async (taxonId) => {
        const response = await dataProvider.getOne('taxon_names_parallel_name_preview', {
          id: taxonId,
          meta: { strict: true },
        });
        return [String(taxonId), response.data as ParallelPreview] as const;
      }),
    )
      .then((entries) => {
        if (!active) return;
        setPreviewByTaxonId(Object.fromEntries(entries));
      })
      .catch((previewError) => {
        if (!active) return;
        notify(previewError instanceof Error ? previewError.message : 'Failed to load parallel previews', { type: 'error' });
        setPreviewByTaxonId({});
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dataProvider, notify, state.data]);

  const displayedRecords = React.useMemo(() => {
    return state.data.filter((record) => {
      const hasParallelUninomialOverride = Boolean(record.parallel_override_uninomial?.trim());
      if (filters.parallelUninomialOverride === 'yes' && !hasParallelUninomialOverride) {
        return false;
      }
      if (filters.parallelUninomialOverride === 'no' && hasParallelUninomialOverride) {
        return false;
      }

      const taxonId = record.taxon_name_id ?? record.id;
      const preview = taxonId != null ? previewByTaxonId[String(taxonId)] : undefined;
      const hasParentLink = Boolean(preview?.parent_taxon_name_ids?.length);
      if (filters.hasParentLink === 'yes' && !hasParentLink) {
        return false;
      }
      if (filters.hasParentLink === 'no' && hasParentLink) {
        return false;
      }

      if (!filters.onlyMismatches) {
        return true;
      }
      if (taxonId == null) return false;
      if (!preview) return false;
      const scientificMatch = Boolean(preview.matches_current_scientific_name);
      const canonicalMatch = (preview.current_canonical_name || '') === (preview.derived_canonical_name || '');
      return !(scientificMatch && canonicalMatch);
    });
  }, [filters.hasParentLink, filters.onlyMismatches, filters.parallelUninomialOverride, previewByTaxonId, state.data]);

  const completedAuditRows = React.useMemo<ReviewRecord[]>(() => {
    if (!lastAuditRun?.result?.mismatch_rows?.length) return [];
    return lastAuditRun.result.mismatch_rows.map((row) => ({
      id: row.taxon_name_id,
      taxon_name_id: row.taxon_name_id,
      scientific_name: row.current_scientific_name || null,
      canonical_name: row.current_canonical_name || null,
      audit_strategy: row.strategy,
      audit_mismatch_kind: row.mismatch_kind,
      audit_current_scientific_name: row.current_scientific_name || null,
      audit_derived_scientific_name: row.derived_scientific_name || null,
      audit_current_canonical_name: row.current_canonical_name || null,
      audit_derived_canonical_name: row.derived_canonical_name || null,
    }));
  }, [lastAuditRun]);

  const usingFullAuditRows = !auditRunning && completedAuditRows.length > 0;
  const pagedFullAuditRows = React.useMemo(() => {
    if (!usingFullAuditRows) return [];
    const start = (page - 1) * perPage;
    return completedAuditRows.slice(start, start + perPage);
  }, [completedAuditRows, page, perPage, usingFullAuditRows]);

  const tableRows = usingFullAuditRows ? pagedFullAuditRows : displayedRecords;
  const tableTotal = usingFullAuditRows ? completedAuditRows.length : state.total;
  const totalPages = Math.max(1, Math.ceil(tableTotal / perPage));
  const fullAuditMismatchCount =
    (auditJobStatus?.scientific_mismatch ?? 0) +
    (auditJobStatus?.author_only_scientific_mismatch ?? 0) +
    (auditJobStatus?.canonical_mismatch ?? 0) +
    (auditJobStatus?.both_mismatch ?? 0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      q: formFilters.q,
      kingdom: formFilters.kingdom,
      rank: formFilters.rank,
      parallelUninomialOverride: formFilters.parallelUninomialOverride,
      hasParentLink: formFilters.hasParentLink,
      currentOnly: formFilters.currentOnly ? 'true' : null,
      onlyMismatches: formFilters.onlyMismatches ? 'true' : 'false',
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setFormFilters({
      q: '',
      kingdom: '',
      rank: '',
      parallelUninomialOverride: '',
      hasParentLink: '',
      currentOnly: false,
      onlyMismatches: true,
    });
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const runFullAudit = React.useCallback(async () => {
    setAuditRunning(true);
    setAuditError(null);
    try {
      const token = localStorage.getItem('token');
      const query = '?strict=true&current_only=true&batch_size=500&mismatch_limit=2000';
      const response = await runAuditRequestWithFallback(token, 'POST', [
        `/taxon_names/_parallel_name_audit_start${query}`,
        `/taxon_names_parallel_name_audit_start${query}`,
      ]);
      const status = (await response.json()) as ParallelAuditJobStatus;
      setAuditJobStatus(status);
      setAuditRunning(status.status === 'running');
      if (status.status === 'running') {
        notify('Full audit started.', { type: 'info' });
      }
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : 'Failed to run full audit';
      setAuditError(message);
      notify(message, { type: 'error' });
      setAuditRunning(false);
    }
  }, [notify]);

  const pollAuditStatus = React.useCallback(async () => {
    const token = localStorage.getItem('token');
    const response = await runAuditRequestWithFallback(token, 'GET', [
      '/taxon_names/_parallel_name_audit_status',
      '/taxon_names_parallel_name_audit_status',
    ]);
    return (await response.json()) as ParallelAuditJobStatus;
  }, []);

  React.useEffect(() => {
    let active = true;
    void pollAuditStatus()
      .then((status) => {
        if (!active) return;
        setAuditJobStatus(status);
        if (status.status === 'running') {
          setAuditRunning(true);
        }
      })
      .catch(() => {
        // Keep page usable if status endpoint is unavailable at load time.
      });

    return () => {
      active = false;
    };
  }, [pollAuditStatus]);

  React.useEffect(() => {
    if (!auditRunning) return;
    let active = true;
    const timer = window.setInterval(() => {
      void pollAuditStatus()
        .then((status) => {
          if (!active) return;
          setAuditJobStatus(status);
          if (status.status !== 'running') {
            setAuditRunning(false);
          }
          if (status.status === 'completed' && status.result) {
            const run = {
              runAt: status.finished_at || new Date().toISOString(),
              result: status.result,
            };
            setLastAuditRun(run);
            localStorage.setItem(AUDIT_RESULT_STORAGE_KEY, JSON.stringify(run));
          }
          if (status.status === 'failed' && status.error_message) {
            setAuditError(status.error_message);
          }
        })
        .catch((error) => {
          if (!active) return;
          setAuditRunning(false);
          setAuditError(error instanceof Error ? error.message : 'Failed to load audit status');
        });
    }, 2000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [auditRunning, pollAuditStatus]);

  const renderCellContent = (column: ColumnKey, record: ReviewRecord) => {
    const taxonId = record.taxon_name_id ?? record.id;
    const preview = taxonId != null ? previewByTaxonId[String(taxonId)] : undefined;
    const kingdomName =
      typeof record.kingdom === 'string' ? record.kingdom : record.kingdom?.kingdom_name;
    const rankName =
      typeof record.taxon_rank === 'string' ? record.taxon_rank : record.taxon_rank?.rank_name;

    switch (column) {
      case 'kingdom':
        return <span className="text-sm text-muted-foreground">{kingdomName || 'Not set'}</span>;
      case 'rank':
        return <span className="text-sm text-muted-foreground">{rankName || 'Not set'}</span>;
      case 'taxonName':
        if (!taxonId) return <span className="text-sm text-muted-foreground">Unknown taxon</span>;
        return (
          <Link to={`/taxon_names/${taxonId}/show`} className="font-medium text-primary hover:underline">
            {record.formatted_scientific_name ? (
              <HtmlValue value={record.formatted_scientific_name} />
            ) : (
              record.scientific_name || `Taxon ${taxonId}`
            )}
          </Link>
        );
      case 'isCurrent':
        return (
          <Badge variant={record.is_current ? 'secondary' : 'outline'}>
            {record.is_current ? 'Yes' : 'No'}
          </Badge>
        );
      case 'strategy':
        if (record.audit_strategy) {
          return <Badge variant="outline">{formatTitle(record.audit_strategy)}</Badge>;
        }
        if (previewLoading && !preview) return <span className="text-sm text-muted-foreground">Loading...</span>;
        return preview ? <Badge variant="outline">{formatTitle(preview.strategy)}</Badge> : <span className="text-sm text-muted-foreground">Unavailable</span>;
      case 'comparison':
        if (record.audit_mismatch_kind) {
          if (record.audit_mismatch_kind === 'both') {
            return <Badge variant="destructive">Scientific + canonical mismatch</Badge>;
          }
          if (record.audit_mismatch_kind === 'canonical_only') {
            return <Badge variant="outline">Canonical mismatch</Badge>;
          }
          return <Badge variant="destructive">Scientific mismatch</Badge>;
        }
        if (previewLoading && !preview) return <span className="text-sm text-muted-foreground">Loading...</span>;
        if (!preview) return <Badge variant="outline">Unavailable</Badge>;
        const scientificMatch = Boolean(preview.matches_current_scientific_name);
        const canonicalMatch = (preview.current_canonical_name || '') === (preview.derived_canonical_name || '');
        if (scientificMatch && canonicalMatch) {
          return <Badge variant="secondary">Matches current</Badge>;
        }
        if (!scientificMatch && !canonicalMatch) {
          return <Badge variant="destructive">Scientific + canonical mismatch</Badge>;
        }
        if (!scientificMatch) {
          return <Badge variant="destructive">Scientific mismatch</Badge>;
        }
        return <Badge variant="outline">Canonical mismatch</Badge>;
      case 'currentScientific':
        if (record.audit_current_scientific_name) {
          return <span className="text-sm">{record.audit_current_scientific_name}</span>;
        }
        if (!preview) {
          return <span className="text-sm text-muted-foreground">{record.scientific_name || 'Not set'}</span>;
        }
        return preview.current_formatted_scientific_name ? (
          <HtmlValue value={preview.current_formatted_scientific_name} />
        ) : (
          <span className="text-sm">{preview.current_scientific_name || 'Not set'}</span>
        );
      case 'derivedScientific':
        if (record.audit_derived_scientific_name) {
          return <span className="text-sm">{record.audit_derived_scientific_name}</span>;
        }
        if (previewLoading && !preview) return <span className="text-sm text-muted-foreground">Loading...</span>;
        return preview?.derived_formatted_scientific_name ? (
          <HtmlValue value={preview.derived_formatted_scientific_name} />
        ) : (
          <span className="text-sm">{preview?.derived_scientific_name || 'Unavailable'}</span>
        );
      case 'currentCanonical':
        if (record.audit_current_canonical_name) {
          return <span className="text-sm">{record.audit_current_canonical_name}</span>;
        }
        return <span className="text-sm">{preview?.current_canonical_name || record.canonical_name || 'Not set'}</span>;
      case 'derivedCanonical':
        if (record.audit_derived_canonical_name) {
          return <span className="text-sm">{record.audit_derived_canonical_name}</span>;
        }
        if (previewLoading && !preview) return <span className="text-sm text-muted-foreground">Loading...</span>;
        return <span className="text-sm">{preview?.derived_canonical_name || 'Unavailable'}</span>;
      case 'actions':
        return taxonId ? (
          <Button asChild variant="outline" size="sm">
            <Link to={`/taxon_names/${taxonId}/show`}>
              <ExternalLink className="h-4 w-4" />
              Open taxon
            </Link>
          </Button>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Parallel Name Review</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Compare current stored names with the strict parallel name engine across the taxon-name register, page by page.
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
                  onChange={(event) => setFormFilters((current) => ({ ...current, q: event.target.value }))}
                  placeholder="Taxon or current name..."
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Kingdom
              <input
                value={formFilters.kingdom}
                onChange={(event) => setFormFilters((current) => ({ ...current, kingdom: event.target.value }))}
                placeholder="e.g. Plantae"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Rank
              <input
                value={formFilters.rank}
                onChange={(event) => setFormFilters((current) => ({ ...current, rank: event.target.value }))}
                placeholder="e.g. Species"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Parallel uninomial override
              <select
                value={formFilters.parallelUninomialOverride}
                onChange={(event) =>
                  setFormFilters((current) => ({
                    ...current,
                    parallelUninomialOverride: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Has parent link
              <select
                value={formFilters.hasParentLink}
                onChange={(event) =>
                  setFormFilters((current) => ({
                    ...current,
                    hasParentLink: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-4">
            <Badge variant="outline" className="self-center">
              Strict parallel mode
            </Badge>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={formFilters.currentOnly}
                onChange={(event) => setFormFilters((current) => ({ ...current, currentOnly: event.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              Current names only
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={formFilters.onlyMismatches}
                onChange={(event) => setFormFilters((current) => ({ ...current, onlyMismatches: event.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              Only show non-matches on this page
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Apply filters</Button>
            <Button type="button" variant="outline" onClick={clearAllFilters}>
              Reset
            </Button>
            <Button type="button" variant="outline" onClick={() => void runFullAudit()} disabled={auditRunning}>
              {auditRunning ? 'Running full audit...' : 'Run Full Audit'}
            </Button>
            {auditJobStatus?.status === 'running' ? (
              <Badge variant="outline">
                Progress: {auditJobStatus.processed.toLocaleString()}
                {auditJobStatus.expected_total > 0
                  ? ` / ${auditJobStatus.expected_total.toLocaleString()}`
                  : ''}
              </Badge>
            ) : null}
            {auditJobStatus ? (
              <Badge variant="outline">
                Full audit mismatches so far: {fullAuditMismatchCount.toLocaleString()}
              </Badge>
            ) : null}
            {usingFullAuditRows ? (
              <Badge variant="secondary">Table source: full audit mismatches</Badge>
            ) : (
              <Badge variant="outline">Table source: page preview</Badge>
            )}
            <Badge variant="outline" className="self-center">
              {loading
                ? 'Loading...'
                : usingFullAuditRows
                  ? `${tableRows.length} shown from full audit mismatches of ${tableTotal.toLocaleString()}`
                  : `${displayedRecords.length} shown in page preview of ${state.total.toLocaleString()} fetched rows`}
            </Badge>
          </div>
        </form>
      </Card>

      {lastAuditRun || auditError ? (
        <Card className="rounded-3xl border border-border/80 p-5 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold tracking-tight">Last Full Audit Run</h2>
              <div className="flex items-center gap-2">
                {auditRunning ? <Badge variant="outline">Running...</Badge> : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAuditPanelCollapsed((current) => !current)}
                >
                  {auditPanelCollapsed ? 'Expand' : 'Collapse'}
                </Button>
              </div>
            </div>
            {!auditPanelCollapsed ? (
              <>
                {auditError ? (
                  <div className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground">
                    {auditError}
                  </div>
                ) : null}
                {lastAuditRun ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Run at {new Date(lastAuditRun.runAt).toLocaleString()}
                    </p>
                    <div className="grid gap-3 md:grid-cols-4">
                      <Badge variant="outline">Processed: {lastAuditRun.result.processed.toLocaleString()}</Badge>
                      <Badge variant="outline">All matched: {lastAuditRun.result.matches_all.toLocaleString()}</Badge>
                      <Badge variant="outline">Scientific only: {lastAuditRun.result.scientific_mismatch.toLocaleString()}</Badge>
                      <Badge variant="outline">Author-only scientific: {lastAuditRun.result.author_only_scientific_mismatch.toLocaleString()}</Badge>
                      <Badge variant="outline">Canonical only: {lastAuditRun.result.canonical_mismatch.toLocaleString()}</Badge>
                      <Badge variant="outline">Both mismatch: {lastAuditRun.result.both_mismatch.toLocaleString()}</Badge>
                      <Badge variant="outline">Errors: {lastAuditRun.result.errors.toLocaleString()}</Badge>
                      <Badge variant="outline">Rows returned: {lastAuditRun.result.mismatch_rows.length.toLocaleString()}</Badge>
                    </div>
                    <div className="space-y-2">
                      {lastAuditRun.result.mismatch_rows.length ? (
                        lastAuditRun.result.mismatch_rows.map((row) => (
                          <div key={`${row.taxon_name_id}-${row.mismatch_kind}-${row.strategy}`} className="rounded-2xl border border-border/80 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-sm font-medium">
                                Taxon {row.taxon_name_id} · {formatTitle(row.mismatch_kind)} · {formatTitle(row.strategy)}
                              </div>
                              <Link to={`/taxon_names/${row.taxon_name_id}/show`} className="text-sm text-primary hover:underline">
                                Open taxon
                              </Link>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Current scientific: {row.current_scientific_name || 'Not set'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Derived scientific: {row.derived_scientific_name || 'Not set'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Current canonical: {row.current_canonical_name || 'Not set'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Derived canonical: {row.derived_canonical_name || 'Not set'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No mismatch rows were returned.</p>
                      )}
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card className="rounded-3xl border border-border/80 p-5 shadow-sm">
        {error ? (
          <div className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            <Spinner size="sm" />
            <span>Loading parallel name review rows...</span>
          </div>
        ) : null}

        {!loading && previewLoading ? (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            <Spinner size="sm" />
            <span>Loading parallel previews for this page...</span>
          </div>
        ) : null}

        <DataTable<ReviewRecord>
          resource="taxon_names"
          storeKey={TABLE_STORE_KEY}
          hiddenColumns={defaultHiddenColumns}
          data={tableRows}
          total={tableTotal}
          isPending={loading || previewLoading}
          isLoading={loading || previewLoading}
          rowClick={false}
          bulkActionButtons={false}
          sort={{ field: sortField, order: sortOrder }}
          setSort={(sort) => updateParams({ sortField: sort.field, sortOrder: sort.order as SortOrder, page: 1 })}
        >
          {columnOptions.map((column) => (
            <DataTable.Col<ReviewRecord>
              key={column.key}
              source={getColumnSource(column.key)}
              label={columnLabelMap[column.key]}
              disableSort={!sortableColumns[column.key]}
              headerClassName={column.key === 'actions' ? 'text-right' : undefined}
              cellClassName={column.key === 'actions' ? 'align-top' : 'align-top whitespace-normal'}
              render={(record) => renderCellContent(column.key, record)}
            />
          ))}
        </DataTable>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="parallel-name-review-per-page" className="text-sm text-muted-foreground">
                Rows
              </label>
              <select
                id="parallel-name-review-per-page"
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
      </Card>
    </div>
  );
};

export default ParallelNameReviewPage;
