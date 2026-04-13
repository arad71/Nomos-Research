import * as React from 'react';
import { ExternalLink, RefreshCcw, Search } from 'lucide-react';
import { useDataProvider, useNotify } from 'react-admin';
import { Link, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/admin/spinner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SortOrder = 'ASC' | 'DESC';
type ScopeFilter = 'no_parent_links' | 'parent_link_overrides' | 'both';

type ReviewRecord = {
  id: number;
  taxon_name_parent_review_id?: number;
  taxon_name_id?: number;
  status?: string | null;
  reason?: string | null;
  parent_count?: number | null;
  taxon_name?: {
    taxon_name_id?: number;
    scientific_name?: string | null;
    formatted_scientific_name?: string | null;
    is_current?: boolean | null;
    parallel_override_uninomial?: string | null;
    parallel_override_specific_epithet?: string | null;
    parallel_override_infraspecific_epithet?: string | null;
    taxon_rank?: {
      rank_name?: string | null;
    } | null;
    kingdom?: {
      kingdom_name?: string | null;
    } | null;
  } | null;
};

type RankRecord = {
  id: number;
  rank_name?: string | null;
};

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [25, 50, 100, 250] as const;
const FETCH_PER_PAGE = 500;
const MAX_REVIEW_PAGES = 60;
const MAX_RANK_PAGES = 20;
const RANK_FETCH_PER_PAGE = 200;
const reviewCacheByScope: Record<string, ReviewRecord[]> = {};

const getReviewCacheKey = (currentOnly: boolean, showResolved: boolean) =>
  `${currentOnly ? 'current' : 'all'}|${showResolved ? 'resolved' : 'unresolved'}`;

const HtmlValue = ({ value }: { value?: string | null }) =>
  value ? <span dangerouslySetInnerHTML={{ __html: value }} /> : null;

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

const normalize = (value?: string | null) => (value ?? '').trim();

const parsePositiveInt = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseScopeFilter = (value: string | null): ScopeFilter => {
  if (value === 'parent_link_overrides' || value === 'both' || value === 'no_parent_links') {
    return value;
  }
  return 'no_parent_links';
};

const hasParallelOverride = (record: ReviewRecord) => {
  const taxon = record.taxon_name;
  if (!taxon) {
    return false;
  }
  return Boolean(
    normalize(taxon.parallel_override_uninomial)
    || normalize(taxon.parallel_override_specific_epithet)
    || normalize(taxon.parallel_override_infraspecific_epithet)
  );
};

const inScope = (record: ReviewRecord, scopeFilter: ScopeFilter) => {
  const parentCount = record.parent_count ?? 0;
  const noParentLinks = parentCount === 0;
  const withParentOverride = parentCount > 0 && hasParallelOverride(record);

  if (scopeFilter === 'no_parent_links') {
    return noParentLinks;
  }
  if (scopeFilter === 'parent_link_overrides') {
    return withParentOverride;
  }
  return noParentLinks || withParentOverride;
};

const NoParentLinksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const dataProviderRef = React.useRef(dataProvider);
  const notifyRef = React.useRef(notify);
  const initialCurrentOnly = searchParams.get('current') !== 'false';
  const initialShowResolved = searchParams.get('resolved') === 'true';
  const initialCacheKey = getReviewCacheKey(initialCurrentOnly, initialShowResolved);
  const initialCachedRows = reviewCacheByScope[initialCacheKey] ?? [];
  const [rows, setRows] = React.useState<ReviewRecord[]>(initialCachedRows);
  const [loading, setLoading] = React.useState(initialCachedRows.length === 0);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState(() => searchParams.get('q') ?? '');
  const [rankFilter, setRankFilter] = React.useState(() => searchParams.get('rank') ?? '');
  const [scopeFilter, setScopeFilter] = React.useState<ScopeFilter>(() =>
    parseScopeFilter(searchParams.get('scope'))
  );
  const [currentOnly, setCurrentOnly] = React.useState(initialCurrentOnly);
  const [showResolved, setShowResolved] = React.useState(initialShowResolved);
  const [page, setPage] = React.useState(() => parsePositiveInt(searchParams.get('page'), 1));
  const [perPage, setPerPage] = React.useState<number>(() => {
    const parsed = parsePositiveInt(searchParams.get('perPage'), DEFAULT_PER_PAGE);
    return PER_PAGE_OPTIONS.includes(parsed as (typeof PER_PAGE_OPTIONS)[number])
      ? parsed
      : DEFAULT_PER_PAGE;
  });
  const [rankOptions, setRankOptions] = React.useState<string[]>([]);
  const cacheKey = React.useMemo(
    () => getReviewCacheKey(currentOnly, showResolved),
    [currentOnly, showResolved]
  );

  React.useEffect(() => {
    dataProviderRef.current = dataProvider;
  }, [dataProvider]);

  React.useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  const loadRanks = React.useCallback(async () => {
    try {
      const foundRanks = new Set<string>();
      for (let rankPage = 1; rankPage <= MAX_RANK_PAGES; rankPage += 1) {
        const response = await dataProviderRef.current.getList('taxon_ranks', {
          pagination: { page: rankPage, perPage: RANK_FETCH_PER_PAGE },
          sort: { field: 'rank_name', order: 'ASC' as SortOrder },
          filter: {},
        });
        const rankRows = (response.data as RankRecord[]) ?? [];
        rankRows.forEach((rank) => {
          const rankName = normalize(rank.rank_name);
          if (rankName) {
            foundRanks.add(rankName);
          }
        });
        const totalRows = response.total ?? foundRanks.size;
        if (rankPage * RANK_FETCH_PER_PAGE >= totalRows || rankRows.length < RANK_FETCH_PER_PAGE) {
          break;
        }
      }
      setRankOptions(Array.from(foundRanks).sort((left, right) => left.localeCompare(right)));
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load rank filters';
      notifyRef.current(message, { type: 'warning' });
    }
  }, []);

  const loadRows = React.useCallback(async (options?: { background?: boolean }) => {
    const background = options?.background ?? false;
    setLoading(!background);
    setError(null);
    try {
      const serverFilter: Record<string, unknown> = {};
      if (currentOnly) {
        serverFilter['taxon_name___is_current'] = true;
      }
      if (!showResolved) {
        serverFilter.status = ['matched_needs_review', 'mismatch', 'ambiguous', 'unmatched', 'ignored'];
      }

      const allRows: ReviewRecord[] = [];
      for (let fetchPage = 1; fetchPage <= MAX_REVIEW_PAGES; fetchPage += 1) {
        const response = await dataProviderRef.current.getList('taxon_name_parent_reviews', {
          pagination: { page: fetchPage, perPage: FETCH_PER_PAGE },
          sort: { field: 'taxon_name___scientific_name', order: 'ASC' as SortOrder },
          filter: serverFilter,
        });
        const pageRows = (response.data as ReviewRecord[]) ?? [];
        allRows.push(...pageRows);
        const totalRows = response.total ?? allRows.length;
        if (allRows.length >= totalRows || pageRows.length < FETCH_PER_PAGE) {
          break;
        }
      }

      setRows(allRows);
      reviewCacheByScope[cacheKey] = allRows;
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load parent review rows';
      if (!background) {
        setError(message);
      }
      notifyRef.current(message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [cacheKey, currentOnly, showResolved]);

  React.useEffect(() => {
    void loadRanks();
  }, [loadRanks]);

  React.useEffect(() => {
    const cachedRows = reviewCacheByScope[cacheKey] ?? [];
    if (cachedRows.length) {
      setRows(cachedRows);
      setLoading(false);
      void loadRows({ background: true });
      return;
    }
    void loadRows({ background: false });
  }, [cacheKey, loadRows]);

  React.useEffect(() => {
    const nextParams = new URLSearchParams();
    if (query) {
      nextParams.set('q', query);
    }
    if (rankFilter) {
      nextParams.set('rank', rankFilter);
    }
    if (scopeFilter !== 'no_parent_links') {
      nextParams.set('scope', scopeFilter);
    }
    if (!currentOnly) {
      nextParams.set('current', 'false');
    }
    if (showResolved) {
      nextParams.set('resolved', 'true');
    }
    if (page > 1) {
      nextParams.set('page', String(page));
    }
    if (perPage !== DEFAULT_PER_PAGE) {
      nextParams.set('perPage', String(perPage));
    }
    const nextString = nextParams.toString();
    const currentString = searchParams.toString();
    if (nextString !== currentString) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [currentOnly, page, perPage, query, rankFilter, scopeFilter, setSearchParams, showResolved]);

  const filteredRows = React.useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return rows.filter((record) => {
      if (!inScope(record, scopeFilter)) {
        return false;
      }

      if (rankFilter) {
        const rankName = normalize(record.taxon_name?.taxon_rank?.rank_name);
        if (rankName !== rankFilter) {
          return false;
        }
      }

      if (!loweredQuery) {
        return true;
      }

      const haystack = [
        record.taxon_name?.scientific_name,
        record.taxon_name?.taxon_rank?.rank_name,
        record.taxon_name?.kingdom?.kingdom_name,
        record.reason,
        record.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(loweredQuery);
    });
  }, [query, rankFilter, rows, scopeFilter]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  React.useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const pagedRows = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRows.slice(start, start + perPage);
  }, [filteredRows, page, perPage]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Parent Link Gaps</h1>
        <p className="max-w-4xl text-sm text-muted-foreground">
          This view supports two review buckets: names with no parent links and names with parent links
          where parallel override fields are set. Rank is shown and can be filtered.
        </p>
      </div>

      <Card className="rounded-3xl border border-border/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-5">
            <label className="space-y-2 text-sm font-medium text-foreground">
              Search
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Taxon, rank, reason..."
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Scope
              <select
                value={scopeFilter}
                onChange={(event) => {
                  setScopeFilter(event.target.value as ScopeFilter);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="no_parent_links">No parent links</option>
                <option value="parent_link_overrides">Parent-linked overrides</option>
                <option value="both">Both</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Rank
              <select
                value={rankFilter}
                onChange={(event) => {
                  setRankFilter(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All ranks</option>
                {rankOptions.map((rankName) => (
                  <option key={rankName} value={rankName}>
                    {rankName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={currentOnly}
                onChange={(event) => {
                  setCurrentOnly(event.target.checked);
                  setPage(1);
                }}
              />
              Current names only
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(event) => {
                  setShowResolved(event.target.checked);
                  setPage(1);
                }}
              />
              Include resolved
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => void loadRows()} disabled={loading}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border border-border/80 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-muted-foreground">
            <Spinner />
            Loading parent link review rows...
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-sm text-destructive">{error}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Taxon</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Kingdom</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Parent count</TableHead>
                  <TableHead>Parallel override</TableHead>
                  <TableHead className="w-[120px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.length ? (
                  pagedRows.map((record) => {
                    const taxonNameId = record.taxon_name_id ?? record.taxon_name?.taxon_name_id;
                    const overrideFlag = hasParallelOverride(record);

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="align-top">
                          {taxonNameId ? (
                            <Link to={`/taxon_names/${taxonNameId}`} className="font-medium text-primary hover:underline">
                              {record.taxon_name?.formatted_scientific_name ? (
                                <HtmlValue value={record.taxon_name.formatted_scientific_name} />
                              ) : (
                                record.taxon_name?.scientific_name || `Taxon ${taxonNameId}`
                              )}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Unknown taxon</span>
                          )}
                        </TableCell>
                        <TableCell>{record.taxon_name?.taxon_rank?.rank_name || 'Unknown'}</TableCell>
                        <TableCell>{record.taxon_name?.kingdom?.kingdom_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(record.status)}>{formatTitle(record.status)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate" title={record.reason ?? undefined}>
                          {record.reason ? formatTitle(record.reason) : 'Not set'}
                        </TableCell>
                        <TableCell>{record.parent_count ?? 0}</TableCell>
                        <TableCell>
                          {overrideFlag ? <Badge>Yes</Badge> : <Badge variant="outline">No</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          {taxonNameId ? (
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/taxon_names/${taxonNameId}`}>
                                <ExternalLink className="h-4 w-4" />
                                Open
                              </Link>
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No rows matched the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 border-t border-border/80 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">{total} records</div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Per page
                  <select
                    value={perPage}
                    onChange={(event) => {
                      setPerPage(Number(event.target.value));
                      setPage(1);
                    }}
                    className="h-9 rounded-lg border border-border bg-background px-2"
                  >
                    {PER_PAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default NoParentLinksPage;
