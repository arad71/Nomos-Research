import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnsButton } from '@/components/admin/columns-button';
import { DataTable } from '@/components/admin/data-table';
import authProvider from '../admin/authProvider';
import AuthorizedButtonLink from './AuthorizedButtonLink';
import RecordActionButtons from './RecordActionButtons';
import { BACKEND_URL } from '../config';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import AuthorType from '../admin/Citations/AuthorType';

type SortOrder = 'ASC' | 'DESC';

type CitationRecord = {
  id?: number;
  citation_id?: number;
  taxon_name_id?: number;
  author_id?: number;
  author_type?: string;
  author_order?: number;
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type CitationsResponse = {
  data: CitationRecord[];
  total: number;
};

type CitationFilters = {
  q: string;
};

type ColumnKey =
  | 'taxonName'
  | 'author'
  | 'authorType'
  | 'authorOrder'
  | 'updatedBy'
  | 'updated'
  | 'deleted'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'citations.kit.datatable';
const DEFAULT_SORT_FIELD = 'updated_on';
const DEFAULT_SORT_ORDER: SortOrder = 'DESC';
const EXPORT_BATCH_SIZE = 500;
const authorTypeMap = AuthorType.reduce<Record<string, string>>((acc, item) => {
  acc[item.id] = item.name;
  return acc;
}, {});

const defaultColumns: ColumnKey[] = [
  'taxonName',
  'author',
  'authorType',
  'authorOrder',
  'actions',
];
const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'taxonName', label: 'Taxon name' },
  { key: 'author', label: 'Author' },
  { key: 'authorType', label: 'Author type' },
  { key: 'authorOrder', label: 'Author order' },
  { key: 'updatedBy', label: 'Updated by' },
  { key: 'updated', label: 'Updated' },
  { key: 'deleted', label: 'Deleted' },
  { key: 'actions', label: 'Actions' },
];
const columnLabelMap = columnOptions.reduce<Record<ColumnKey, string>>(
  (acc, column) => ((acc[column.key] = column.label), acc),
  {} as Record<ColumnKey, string>
);
const sortableColumns: Partial<Record<ColumnKey, string>> = {
  taxonName: 'taxon_name_id',
  author: 'author_id',
  authorType: 'author_type',
  authorOrder: 'author_order',
  updatedBy: 'updated_by',
  updated: 'updated_on',
  deleted: 'deleted',
};
const getColumnSource = (column: ColumnKey) => sortableColumns[column] ?? column;
const defaultHiddenColumns = columnOptions
  .map((column) => column.key)
  .filter((key) => !defaultColumns.includes(key))
  .map(getColumnSource);

const buildHeaders = () => {
  const headers = new Headers({ Accept: 'application/json' });
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
};

const parseTotal = (response: Response, rows: unknown[]) => {
  const contentRange = response.headers.get('content-range');
  if (contentRange) {
    const total = Number(contentRange.split('/').pop());
    if (!Number.isNaN(total)) return total;
  }
  return rows.length;
};

const fetchReferenceMap = async (
  resource: string,
  ids: number[],
  idField: string,
  labelField: string,
  retryOnAuthError = true
) => {
  if (!ids.length) return {} as Record<number, string>;
  const sort = encodeURIComponent(JSON.stringify([idField, 'ASC']));
  const range = encodeURIComponent(JSON.stringify([0, ids.length + 20]));
  const filter = encodeURIComponent(JSON.stringify({ [idField]: ids }));
  const response = await fetch(
    `${BACKEND_URL}/${resource}?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );
  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchReferenceMap(resource, ids, idField, labelField, false);
  }
  if (!response.ok) return {};
  const rows = await response.json();
  if (!Array.isArray(rows)) return {};
  return rows.reduce((acc: Record<number, string>, row: Record<string, unknown>) => {
    const key = Number(row[idField] ?? row.id);
    const value = String(row[labelField] ?? '');
    if (!Number.isNaN(key) && value) acc[key] = value;
    return acc;
  }, {});
};

const fetchCitations = async (
  page: number,
  perPage: number,
  sortField: string,
  sortOrder: SortOrder,
  filters: CitationFilters,
  retryOnAuthError = true
): Promise<CitationsResponse> => {
  const sort = encodeURIComponent(JSON.stringify([sortField, sortOrder]));
  const range = encodeURIComponent(JSON.stringify([(page - 1) * perPage, page * perPage - 1]));
  const filter = encodeURIComponent(JSON.stringify(filters.q ? { q: filters.q } : {}));
  const response = await fetch(
    `${BACKEND_URL}/citations?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );
  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchCitations(page, perPage, sortField, sortOrder, filters, false);
  }
  if (!response.ok) throw new Error(`Failed to load citations (${response.status})`);
  const rows = await response.json();
  const data = Array.isArray(rows)
    ? rows.map((row) => ({ ...row, id: row.id ?? row.citation_id }))
    : [];
  return { data, total: parseTotal(response, data) };
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const renderBoolean = (value?: boolean) => (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '');

const renderHtml = (value?: string) =>
  value ? <span dangerouslySetInnerHTML={{ __html: value }} /> : '';

const escapeCsvValue = (value: string | number | boolean | null | undefined) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
};

const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const CitationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = React.useMemo<CitationFilters>(
    () => ({ q: searchParams.get('q') || '' }),
    [searchParams]
  );
  const page = Math.max(Number(searchParams.get('page') || '1'), 1);
  const perPage = React.useMemo(() => {
    const parsed = Number(searchParams.get('perPage') || String(DEFAULT_PER_PAGE));
    return PER_PAGE_OPTIONS.includes(parsed as (typeof PER_PAGE_OPTIONS)[number])
      ? parsed
      : DEFAULT_PER_PAGE;
  }, [searchParams]);
  const sortField = searchParams.get('sortField') || DEFAULT_SORT_FIELD;
  const sortOrder: SortOrder =
    searchParams.get('sortOrder') === 'ASC' ? 'ASC' : DEFAULT_SORT_ORDER;
  const [draftFilters, setDraftFilters] = React.useState(filters);
  const [taxonNameMap, setTaxonNameMap] = React.useState<Record<number, string>>({});
  const [authorMap, setAuthorMap] = React.useState<Record<number, string>>({});
  const [userMap, setUserMap] = React.useState<Record<number, string>>({});
  const [isExporting, setIsExporting] = React.useState(false);
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string | null;
    data: CitationRecord[];
    total: number;
  }>({ loading: true, error: null, data: [], total: 0 });

  React.useEffect(() => setDraftFilters(filters), [filters]);

  React.useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    fetchCitations(page, perPage, sortField, sortOrder, filters)
      .then((result) => active && setState({ loading: false, error: null, data: result.data, total: result.total }))
      .catch((error: Error) => active && setState({ loading: false, error: error.message, data: [], total: 0 }));
    return () => {
      active = false;
    };
  }, [filters, page, perPage, sortField, sortOrder]);

  React.useEffect(() => {
    const taxonNameIds = Array.from(
      new Set(
        state.data
          .map((record) => record.taxon_name_id)
          .filter((value): value is number => typeof value === 'number')
      )
    );
    const authorIds = Array.from(
      new Set(
        state.data
          .map((record) => record.author_id)
          .filter((value): value is number => typeof value === 'number')
      )
    );
    const userIds = Array.from(
      new Set(
        state.data
          .map((record) => record.updated_by)
          .filter((value): value is number => typeof value === 'number')
      )
    );
    Promise.all([
      fetchReferenceMap('taxon_names', taxonNameIds, 'taxon_name_id', 'formatted_scientific_name'),
      fetchReferenceMap('authors', authorIds, 'author_id', 'display_name'),
      fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
    ]).then(([nextTaxonNameMap, nextAuthorMap, nextUserMap]) => {
      setTaxonNameMap(nextTaxonNameMap);
      setAuthorMap(nextAuthorMap);
      setUserMap(nextUserMap);
    });
  }, [state.data]);

  const totalPages = Math.max(Math.ceil(state.total / perPage), 1);
  const activeFilterBadges = filters.q ? [{ label: 'Query', value: filters.q }] : [];

  const updateParams = (updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ q: draftFilters.q || null, page: 1 });
  };

  const clearAllFilters = () => {
    setDraftFilters({ q: '' });
    setSearchParams(new URLSearchParams());
  };

  const buildExportCsv = (
    records: CitationRecord[],
    exportTaxonNameMap: Record<number, string>,
    exportAuthorMap: Record<number, string>,
    exportUserMap: Record<number, string>
  ) =>
    [
      ['Citation ID', 'Taxon name', 'Author', 'Author type', 'Author order', 'Updated by', 'Updated', 'Deleted'],
      ...records.map((record) => [
        record.citation_id ?? record.id ?? '',
        record.taxon_name_id ? exportTaxonNameMap[record.taxon_name_id] ?? '' : '',
        record.author_id ? exportAuthorMap[record.author_id] ?? '' : '',
        record.author_type ? authorTypeMap[record.author_type] ?? record.author_type : '',
        record.author_order ?? '',
        record.updated_by ? exportUserMap[record.updated_by] ?? '' : '',
        record.updated_on ?? '',
        renderBoolean(record.deleted),
      ]),
    ]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');

  const handleExport = async () => {
    if (isExporting || state.total === 0) return;
    try {
      setIsExporting(true);
      const exportPages = Math.max(Math.ceil(state.total / EXPORT_BATCH_SIZE), 1);
      const allRecords: CitationRecord[] = [];
      for (let currentPage = 1; currentPage <= exportPages; currentPage += 1) {
        const result = await fetchCitations(currentPage, EXPORT_BATCH_SIZE, sortField, sortOrder, filters);
        allRecords.push(...result.data);
      }
      const taxonNameIds = Array.from(
        new Set(
          allRecords
            .map((record) => record.taxon_name_id)
            .filter((value): value is number => typeof value === 'number')
        )
      );
      const authorIds = Array.from(
        new Set(
          allRecords
            .map((record) => record.author_id)
            .filter((value): value is number => typeof value === 'number')
        )
      );
      const userIds = Array.from(
        new Set(
          allRecords
            .map((record) => record.updated_by)
            .filter((value): value is number => typeof value === 'number')
        )
      );
      const [exportTaxonNameMap, exportAuthorMap, exportUserMap] = await Promise.all([
        fetchReferenceMap('taxon_names', taxonNameIds, 'taxon_name_id', 'formatted_scientific_name'),
        fetchReferenceMap('authors', authorIds, 'author_id', 'display_name'),
        fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
      ]);
      const csv = buildExportCsv(allRecords, exportTaxonNameMap, exportAuthorMap, exportUserMap);
      downloadCsv(`citations_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCellContent = (column: ColumnKey, record: CitationRecord) => {
    const citationId = record.citation_id ?? record.id ?? 0;
    switch (column) {
      case 'taxonName':
        return (
          <span className="inline-flex items-center gap-2">
            <span>{renderHtml(record.taxon_name_id ? taxonNameMap[record.taxon_name_id] : '')}</span>
            {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
          </span>
        );
      case 'author':
        return (record.author_id && authorMap[record.author_id]) || '';
      case 'authorType':
        return record.author_type ? authorTypeMap[record.author_type] ?? record.author_type : '';
      case 'authorOrder':
        return record.author_order ?? '';
      case 'updatedBy':
        return (record.updated_by && userMap[record.updated_by]) || '';
      case 'updated':
        return <span className="text-muted-foreground">{formatDate(record.updated_on)}</span>;
      case 'deleted':
        return renderBoolean(record.deleted);
      case 'actions':
        return (
          <RecordActionButtons
            resource="citations"
            showTo={`/citations/${citationId}/show`}
            editTo={`/citations/${citationId}`}
          />
        );
      default:
        return '';
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Citations</h1>
            <Badge variant="outline">{state.total} result{state.total === 1 ? '' : 's'}</Badge>
            {activeFilterBadges.map((filter) => (
              <Badge key={filter.value} variant="outline">
                {filter.label}: {filter.value}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {activeFilterBadges.length > 0 ? (
            <Button type="button" variant="outline" onClick={clearAllFilters}>
              Clear active filters
            </Button>
          ) : null}
          <AuthorizedButtonLink resource="citations" action="create" to="/citations/create" variant="outline">
            <Plus className="h-4 w-4" />
            Create
          </AuthorizedButtonLink>
          <ColumnsButton resource="citations" storeKey={TABLE_STORE_KEY} />
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={state.loading || isExporting || state.total === 0}
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <form className="space-y-4 xl:sticky xl:top-6 xl:h-fit" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={draftFilters.q}
                onChange={(event) => setDraftFilters({ q: event.target.value })}
                placeholder="Search citations"
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Apply filters</Button>
            <Button type="button" variant="outline" onClick={clearAllFilters}>
              Reset
            </Button>
          </div>
        </form>
        <div className="space-y-4">
          {state.error ? (
            <div className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground">
              {state.error}
            </div>
          ) : null}
          <DataTable<CitationRecord>
            resource="citations"
            storeKey={TABLE_STORE_KEY}
            hiddenColumns={defaultHiddenColumns}
            data={state.data}
            total={state.total}
            isPending={state.loading}
            isLoading={state.loading}
            rowClick={false}
            sort={{ field: sortField, order: sortOrder }}
            setSort={(sort) =>
              updateParams({ sortField: sort.field, sortOrder: sort.order as SortOrder, page: 1 })
            }
            bulkActionButtons={false}
          >
            {columnOptions.map((column) => (
              <DataTable.Col<CitationRecord>
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
                <label htmlFor="citations-per-page" className="text-sm text-muted-foreground">
                  Rows
                </label>
                <select
                  id="citations-per-page"
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
                  disabled={page <= 1 || state.loading}
                  onClick={() => updateParams({ page: page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages || state.loading}
                  onClick={() => updateParams({ page: page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitationsPage;
