import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnsButton } from '@/components/admin/columns-button';
import { DataTable } from '@/components/admin/data-table';
import authProvider from '../app/authProvider';
import AuthorizedButtonLink from '../shared/AuthorizedButtonLink';
import RecordActionButtons from '../shared/RecordActionButtons';
import { BACKEND_URL } from '../../config';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

type SortOrder = 'ASC' | 'DESC';

type PublicationRecord = {
  id?: number;
  publication_id?: number;
  display_title?: string;
  author_name?: string;
  publication_year?: string | number;
  published?: boolean;
  abbreviated_title?: string;
  title?: string;
  bad_publication?: boolean;
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type PublicationsResponse = {
  data: PublicationRecord[];
  total: number;
};

type PublicationFilters = {
  q: string;
};

type ColumnKey =
  | 'displayTitle'
  | 'authorName'
  | 'publicationYear'
  | 'published'
  | 'abbreviatedTitle'
  | 'title'
  | 'badPublication'
  | 'updatedBy'
  | 'updated'
  | 'deleted'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'publications.kit.datatable';
const DEFAULT_SORT_FIELD = 'display_title';
const DEFAULT_SORT_ORDER: SortOrder = 'ASC';
const EXPORT_BATCH_SIZE = 500;

const defaultColumns: ColumnKey[] = [
  'displayTitle',
  'authorName',
  'publicationYear',
  'published',
  'abbreviatedTitle',
  'actions',
];
const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'displayTitle', label: 'Display title' },
  { key: 'authorName', label: 'Author' },
  { key: 'publicationYear', label: 'Year' },
  { key: 'published', label: 'Published' },
  { key: 'abbreviatedTitle', label: 'Abbreviated title' },
  { key: 'title', label: 'Title' },
  { key: 'badPublication', label: 'Bad publication' },
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
  displayTitle: 'display_title',
  authorName: 'author_name',
  publicationYear: 'publication_year',
  published: 'published',
  abbreviatedTitle: 'abbreviated_title',
  title: 'title',
  badPublication: 'bad_publication',
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

const fetchPublications = async (
  page: number,
  perPage: number,
  sortField: string,
  sortOrder: SortOrder,
  filters: PublicationFilters,
  retryOnAuthError = true
): Promise<PublicationsResponse> => {
  const sort = encodeURIComponent(JSON.stringify([sortField, sortOrder]));
  const range = encodeURIComponent(JSON.stringify([(page - 1) * perPage, page * perPage - 1]));
  const filter = encodeURIComponent(JSON.stringify(filters.q ? { q: filters.q } : {}));
  const response = await fetch(
    `${BACKEND_URL}/publications?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );
  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchPublications(page, perPage, sortField, sortOrder, filters, false);
  }
  if (!response.ok) throw new Error(`Failed to load publications (${response.status})`);
  const rows = await response.json();
  const data = Array.isArray(rows)
    ? rows.map((row) => ({ ...row, id: row.id ?? row.publication_id }))
    : [];
  return { data, total: parseTotal(response, data) };
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const renderBoolean = (value?: boolean) => (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '');

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

const PublicationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = React.useMemo<PublicationFilters>(
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
    searchParams.get('sortOrder') === 'DESC' ? 'DESC' : DEFAULT_SORT_ORDER;
  const [draftFilters, setDraftFilters] = React.useState(filters);
  const [userMap, setUserMap] = React.useState<Record<number, string>>({});
  const [isExporting, setIsExporting] = React.useState(false);
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string | null;
    data: PublicationRecord[];
    total: number;
  }>({ loading: true, error: null, data: [], total: 0 });

  React.useEffect(() => setDraftFilters(filters), [filters]);

  React.useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    fetchPublications(page, perPage, sortField, sortOrder, filters)
      .then((result) => active && setState({ loading: false, error: null, data: result.data, total: result.total }))
      .catch((error: Error) => active && setState({ loading: false, error: error.message, data: [], total: 0 }));
    return () => {
      active = false;
    };
  }, [filters, page, perPage, sortField, sortOrder]);

  React.useEffect(() => {
    const userIds = Array.from(
      new Set(
        state.data
          .map((record) => record.updated_by)
          .filter((value): value is number => typeof value === 'number')
      )
    );
    fetchReferenceMap('users', userIds, 'user_id', 'full_name').then(setUserMap);
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

  const buildExportCsv = (records: PublicationRecord[], exportUserMap: Record<number, string>) =>
    [
      [
        'Publication ID',
        'Display title',
        'Author',
        'Year',
        'Published',
        'Abbreviated title',
        'Title',
        'Bad publication',
        'Updated by',
        'Updated',
        'Deleted',
      ],
      ...records.map((record) => [
        record.publication_id ?? record.id ?? '',
        record.display_title ?? '',
        record.author_name ?? '',
        record.publication_year ?? '',
        renderBoolean(record.published),
        record.abbreviated_title ?? '',
        record.title ?? '',
        renderBoolean(record.bad_publication),
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
      const allRecords: PublicationRecord[] = [];
      for (let currentPage = 1; currentPage <= exportPages; currentPage += 1) {
        const result = await fetchPublications(currentPage, EXPORT_BATCH_SIZE, sortField, sortOrder, filters);
        allRecords.push(...result.data);
      }
      const userIds = Array.from(
        new Set(
          allRecords
            .map((record) => record.updated_by)
            .filter((value): value is number => typeof value === 'number')
        )
      );
      const exportUserMap = await fetchReferenceMap('users', userIds, 'user_id', 'full_name');
      const csv = buildExportCsv(allRecords, exportUserMap);
      downloadCsv(`publications_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCellContent = (column: ColumnKey, record: PublicationRecord) => {
    const publicationId = record.publication_id ?? record.id ?? 0;
    switch (column) {
      case 'displayTitle':
        return (
          <span className="inline-flex items-center gap-2">
            <span>{record.display_title ?? ''}</span>
            {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
          </span>
        );
      case 'authorName':
        return record.author_name ?? '';
      case 'publicationYear':
        return record.publication_year ?? '';
      case 'published':
        return renderBoolean(record.published);
      case 'abbreviatedTitle':
        return record.abbreviated_title ?? '';
      case 'title':
        return record.title ?? '';
      case 'badPublication':
        return renderBoolean(record.bad_publication);
      case 'updatedBy':
        return (record.updated_by && userMap[record.updated_by]) || '';
      case 'updated':
        return <span className="text-muted-foreground">{formatDate(record.updated_on)}</span>;
      case 'deleted':
        return renderBoolean(record.deleted);
      case 'actions':
        return (
          <RecordActionButtons
            resource="publications"
            showTo={`/publications/${publicationId}/show`}
            editTo={`/publications/${publicationId}`}
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
            <h1 className="text-2xl font-semibold tracking-tight">Publications</h1>
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
          <AuthorizedButtonLink resource="publications" action="create" to="/publications/create" variant="outline">
            <Plus className="h-4 w-4" />
            Create
          </AuthorizedButtonLink>
          <ColumnsButton resource="publications" storeKey={TABLE_STORE_KEY} />
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
                placeholder="Search publications"
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
          <DataTable<PublicationRecord>
            resource="publications"
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
              <DataTable.Col<PublicationRecord>
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
                <label htmlFor="publications-per-page" className="text-sm text-muted-foreground">
                  Rows
                </label>
                <select
                  id="publications-per-page"
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

export default PublicationsPage;
