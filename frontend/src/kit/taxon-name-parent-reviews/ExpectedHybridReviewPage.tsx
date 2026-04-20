import * as React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, RefreshCcw, Search } from 'lucide-react';
import { useDataProvider, useNotify } from 'react-admin';
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
import { Spinner } from '@/components/admin/spinner';

type SortOrder = 'ASC' | 'DESC';

type TaxonNameRecord = {
  id: number;
  taxon_name_id?: number;
  scientific_name?: string | null;
  formatted_scientific_name?: string | null;
  canonical_name?: string | null;
  is_current?: boolean | null;
  is_hybrid?: boolean | null;
  hybrid_category?: string | null;
  uninomial?: string | null;
  specific_epithet?: string | null;
  parallel_override_uninomial?: string | null;
  parallel_override_specific_epithet?: string | null;
  taxon_rank?: {
    rank_name?: string | null;
  } | null;
  kingdom?: {
    kingdom_name?: string | null;
  } | null;
};

type ParentCountBucket = 'all' | '0' | '1' | '2+';
type HybridPattern = 'named_hybrid' | 'formula_hybrid' | 'generic_hybrid' | 'hybrid_flag_only';
type PatternFilter = 'all' | HybridPattern;

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [25, 50, 100] as const;
const FETCH_PER_PAGE = 500;
const MAX_PAGES_PER_QUERY = 40;

const HtmlValue = ({ value }: { value?: string | null }) =>
  value ? <span dangerouslySetInnerHTML={{ __html: value }} /> : null;

const normalizeWhitespace = (value?: string | null) => (value ?? '').trim();

const startsWithNamedHybridToken = (value?: string | null) => /^\s*[xX]\s+/.test(value ?? '');
const startsWithMultiplicationSign = (value?: string | null) => /^\s*×\S*/.test(value ?? '');
const containsHybridInfix = (value?: string | null) => /\s[×xX]\s/.test(value ?? '');

const inferHybridPattern = (record: TaxonNameRecord): HybridPattern => {
  const specific = normalizeWhitespace(record.parallel_override_specific_epithet)
    || normalizeWhitespace(record.specific_epithet);
  const uninomial = normalizeWhitespace(record.parallel_override_uninomial)
    || normalizeWhitespace(record.uninomial);
  const scientific = normalizeWhitespace(record.scientific_name);
  const hybridCategory = normalizeWhitespace(record.hybrid_category).toLowerCase();

  if (startsWithNamedHybridToken(specific) || startsWithMultiplicationSign(specific)) {
    return 'named_hybrid';
  }
  if (containsHybridInfix(scientific) || hybridCategory === 'hybrid_formula' || hybridCategory === 'intergrade') {
    return 'formula_hybrid';
  }
  if (startsWithNamedHybridToken(uninomial) || startsWithMultiplicationSign(uninomial)) {
    return 'generic_hybrid';
  }
  return 'hybrid_flag_only';
};

const isExpectedHybrid = (record: TaxonNameRecord) => {
  if (record.is_hybrid) {
    return true;
  }

  const specific = normalizeWhitespace(record.specific_epithet);
  const parallelSpecific = normalizeWhitespace(record.parallel_override_specific_epithet);
  const uninomial = normalizeWhitespace(record.uninomial);
  const parallelUninomial = normalizeWhitespace(record.parallel_override_uninomial);
  const scientific = normalizeWhitespace(record.scientific_name);

  return (
    startsWithNamedHybridToken(specific)
    || startsWithMultiplicationSign(specific)
    || startsWithNamedHybridToken(parallelSpecific)
    || startsWithMultiplicationSign(parallelSpecific)
    || startsWithNamedHybridToken(uninomial)
    || startsWithMultiplicationSign(uninomial)
    || startsWithNamedHybridToken(parallelUninomial)
    || startsWithMultiplicationSign(parallelUninomial)
    || containsHybridInfix(scientific)
  );
};

const formatPattern = (pattern: HybridPattern) => {
  switch (pattern) {
    case 'named_hybrid':
      return 'Named hybrid';
    case 'formula_hybrid':
      return 'Formula hybrid';
    case 'generic_hybrid':
      return 'Generic hybrid';
    default:
      return 'Flagged hybrid';
  }
};

const formatParentCountBadge = (parentCount: number | null | undefined) => {
  if (parentCount == null) {
    return <Badge variant="outline">Loading</Badge>;
  }
  if (parentCount === 0) {
    return <Badge variant="destructive">0 parents</Badge>;
  }
  if (parentCount === 1) {
    return <Badge variant="outline">1 parent</Badge>;
  }
  return <Badge>{parentCount} parents</Badge>;
};

const fetchAllTaxonNames = async (
  dataProvider: ReturnType<typeof useDataProvider>,
  filter: Record<string, unknown>,
) => {
  const rows: TaxonNameRecord[] = [];

  for (let page = 1; page <= MAX_PAGES_PER_QUERY; page += 1) {
    const response = await dataProvider.getList('taxon_names', {
      pagination: { page, perPage: FETCH_PER_PAGE },
      sort: { field: 'scientific_name', order: 'ASC' as SortOrder },
      filter,
    });

    const data = (response.data as TaxonNameRecord[]) ?? [];
    rows.push(...data);

    const total = response.total ?? rows.length;
    if (rows.length >= total || data.length < FETCH_PER_PAGE) {
      break;
    }
  }

  return rows;
};

const ExpectedHybridReviewPage = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [rows, setRows] = React.useState<TaxonNameRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [parentBucket, setParentBucket] = React.useState<ParentCountBucket>('all');
  const [patternFilter, setPatternFilter] = React.useState<PatternFilter>('all');
  const [currentOnly, setCurrentOnly] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState<number>(DEFAULT_PER_PAGE);
  const [parentCounts, setParentCounts] = React.useState<Record<number, number>>({});
  const [loadingParentCounts, setLoadingParentCounts] = React.useState(false);

  const loadRows = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [flaggedRows, xRows, timesRows] = await Promise.all([
        fetchAllTaxonNames(dataProvider, { is_hybrid: true }),
        fetchAllTaxonNames(dataProvider, { q: ' x ' }),
        fetchAllTaxonNames(dataProvider, { q: ' × ' }),
      ]);

      const deduped = new Map<number, TaxonNameRecord>();
      [...flaggedRows, ...xRows, ...timesRows].forEach((record) => {
        const id = record.id ?? record.taxon_name_id;
        if (id == null || !isExpectedHybrid(record)) {
          return;
        }
        deduped.set(id, { ...record, id });
      });

      const nextRows = Array.from(deduped.values()).sort((left, right) =>
        normalizeWhitespace(left.scientific_name).localeCompare(normalizeWhitespace(right.scientific_name))
      );

      setRows(nextRows);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load expected hybrids';
      setError(message);
      notify(message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [dataProvider, notify]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = React.useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return rows.filter((record) => {
      if (currentOnly && record.is_current === false) {
        return false;
      }

      const pattern = inferHybridPattern(record);
      if (patternFilter !== 'all' && pattern !== patternFilter) {
        return false;
      }

      const parentCount = parentCounts[record.id];
      if (parentBucket === '0' && parentCount !== 0) {
        return false;
      }
      if (parentBucket === '1' && parentCount !== 1) {
        return false;
      }
      if (parentBucket === '2+' && !(typeof parentCount === 'number' && parentCount >= 2)) {
        return false;
      }

      if (!loweredQuery) {
        return true;
      }

      const haystack = [
        record.scientific_name,
        record.canonical_name,
        record.hybrid_category,
        record.taxon_rank?.rank_name,
        record.kingdom?.kingdom_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(loweredQuery);
    });
  }, [currentOnly, parentBucket, parentCounts, patternFilter, query, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));

  React.useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const pagedRows = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRows.slice(start, start + perPage);
  }, [filteredRows, page, perPage]);

  React.useEffect(() => {
    let active = true;
    const idsToLoad = pagedRows
      .map((record) => record.id)
      .filter((id) => parentCounts[id] == null);

    if (!idsToLoad.length) {
      return () => {
        active = false;
      };
    }

    setLoadingParentCounts(true);

    void Promise.all(
      idsToLoad.map(async (taxonNameId) => {
        const response = await dataProvider.getList('taxon_name_parents', {
          pagination: { page: 1, perPage: 5 },
          sort: { field: 'sequence', order: 'ASC' as SortOrder },
          filter: { taxon_name_id: taxonNameId },
        });
        return [taxonNameId, response.total ?? (response.data?.length ?? 0)] as const;
      })
    )
      .then((pairs) => {
        if (!active) {
          return;
        }
        setParentCounts((current) => {
          const next = { ...current };
          pairs.forEach(([taxonNameId, count]) => {
            next[taxonNameId] = count;
          });
          return next;
        });
      })
      .catch((loadError) => {
        if (!active) {
          return;
        }
        const message = loadError instanceof Error ? loadError.message : 'Failed to load parent counts';
        notify(message, { type: 'error' });
      })
      .finally(() => {
        if (active) {
          setLoadingParentCounts(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataProvider, notify, pagedRows, parentCounts]);

  const summary = React.useMemo(() => {
    const counts = {
      total: rows.length,
      untagged: 0,
      zeroParents: 0,
      oneParent: 0,
      twoOrMoreParents: 0,
    };

    rows.forEach((record) => {
      if (!record.is_hybrid) {
        counts.untagged += 1;
      }
      const parentCount = parentCounts[record.id];
      if (parentCount === 0) counts.zeroParents += 1;
      if (parentCount === 1) counts.oneParent += 1;
      if (typeof parentCount === 'number' && parentCount >= 2) counts.twoOrMoreParents += 1;
    });

    return counts;
  }, [parentCounts, rows]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Expected Hybrid Review</h1>
        <p className="max-w-4xl text-sm text-muted-foreground">
          This list gathers names that look like hybrids from either their saved hybrid flags or
          their current name pattern. It is designed as a work queue for checking whether the new
          parent linkage has been added correctly.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-3xl border border-border/80 p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Expected hybrids</div>
          <div className="mt-2 text-3xl font-semibold">{summary.total}</div>
        </Card>
        <Card className="rounded-3xl border border-border/80 p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">No parent links</div>
          <div className="mt-2 text-3xl font-semibold">{summary.zeroParents}</div>
        </Card>
        <Card className="rounded-3xl border border-border/80 p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Single parent only</div>
          <div className="mt-2 text-3xl font-semibold">{summary.oneParent}</div>
        </Card>
        <Card className="rounded-3xl border border-border/80 p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">Not yet tagged hybrid</div>
          <div className="mt-2 text-3xl font-semibold">{summary.untagged}</div>
        </Card>
      </div>

      <Card className="rounded-3xl border border-border/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-4">
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
                  placeholder="Taxon, rank, hybrid category..."
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Parent links
              <select
                value={parentBucket}
                onChange={(event) => {
                  setParentBucket(event.target.value as ParentCountBucket);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All counts</option>
                <option value="0">0 parents</option>
                <option value="1">1 parent</option>
                <option value="2+">2+ parents</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              Pattern
              <select
                value={patternFilter}
                onChange={(event) => {
                  setPatternFilter(event.target.value as PatternFilter);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All patterns</option>
                <option value="named_hybrid">Named hybrids</option>
                <option value="formula_hybrid">Formula hybrids</option>
                <option value="generic_hybrid">Generic hybrids</option>
                <option value="hybrid_flag_only">Flagged only</option>
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
            Loading expected hybrids...
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
                  <TableHead>Pattern</TableHead>
                  <TableHead>Hybrid flag</TableHead>
                  <TableHead>Hybrid category</TableHead>
                  <TableHead>Parent links</TableHead>
                  <TableHead className="w-[120px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.length ? (
                  pagedRows.map((record) => {
                    const taxonNameId = record.id ?? record.taxon_name_id;
                    const pattern = inferHybridPattern(record);
                    return (
                      <TableRow key={taxonNameId}>
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <Link
                              to={`/taxon_names/${taxonNameId}/show`}
                              className="font-medium text-primary hover:underline"
                            >
                              {record.formatted_scientific_name ? (
                                <HtmlValue value={record.formatted_scientific_name} />
                              ) : (
                                record.scientific_name || `Taxon ${taxonNameId}`
                              )}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {record.kingdom?.kingdom_name || 'Unknown kingdom'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{record.taxon_rank?.rank_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatPattern(pattern)}</Badge>
                        </TableCell>
                        <TableCell>
                          {record.is_hybrid ? <Badge>Yes</Badge> : <Badge variant="destructive">No</Badge>}
                        </TableCell>
                        <TableCell>
                          {record.hybrid_category ? (
                            <Badge variant="outline">{record.hybrid_category}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatParentCountBadge(parentCounts[taxonNameId])}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/taxon_names/${taxonNameId}`}>
                              <ExternalLink className="h-4 w-4" />
                              Open
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No expected hybrids matched the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 border-t border-border/80 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredRows.length} records
                {loadingParentCounts ? ' · updating parent counts…' : ''}
              </div>
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

export default ExpectedHybridReviewPage;
