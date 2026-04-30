import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { useCanAccess } from 'ra-core';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnsButton } from '@/components/admin/columns-button';
import { DataTable } from '@/components/admin/data-table';
import authProvider from '../app/authProvider';
import AuthorizedButtonLink from '../shared/AuthorizedButtonLink';
import RecordActionButtons from '../shared/RecordActionButtons';
import { formatAuthorOption } from './authorDisplay';
import AuthorDiscipline from '../shared/choices/AuthorDiscipline';
import { BACKEND_URL } from '../../config';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

type SortOrder = 'ASC' | 'DESC';

type AuthorRecord = {
  id?: number;
  author_id?: number;
  abbreviation?: string;
  surname?: string;
  first_names?: string;
  initials?: string;
  discipline?: string;
  effective_from?: string;
  effective_to?: string;
  orc_id?: string;
  legacy_id_name?: string;
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type AuthorsResponse = {
  data: AuthorRecord[];
  total: number;
};

type AuthorFilters = {
  q: string;
  abbreviation: string;
  surname: string;
  firstNames: string;
  discipline: string;
  legacyIdName: string;
  deleted: string;
};

type ColumnKey =
  | 'abbreviation'
  | 'surname'
  | 'firstNames'
  | 'initials'
  | 'discipline'
  | 'effectiveFrom'
  | 'effectiveTo'
  | 'orcId'
  | 'updatedBy'
  | 'updated'
  | 'deleted'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'authors.kit.datatable';
const DEFAULT_SORT_FIELD = 'abbreviation';
const DEFAULT_SORT_ORDER: SortOrder = 'ASC';
const EXPORT_BATCH_SIZE = 500;

const defaultColumns: ColumnKey[] = [
  'abbreviation',
  'surname',
  'firstNames',
  'initials',
  'discipline',
  'effectiveFrom',
  'effectiveTo',
  'orcId',
  'actions',
];
const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'abbreviation', label: 'Abbreviation' },
  { key: 'surname', label: 'Surname' },
  { key: 'firstNames', label: 'First names' },
  { key: 'initials', label: 'Initials' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'effectiveFrom', label: 'Effective from' },
  { key: 'effectiveTo', label: 'Effective to' },
  { key: 'orcId', label: 'ORC ID' },
  { key: 'updatedBy', label: 'Updated by' },
  { key: 'updated', label: 'Updated on' },
  { key: 'deleted', label: 'Deleted' },
  { key: 'actions', label: 'Actions' },
];
const columnLabelMap = columnOptions.reduce<Record<ColumnKey, string>>(
  (acc, column) => ((acc[column.key] = column.label), acc),
  {} as Record<ColumnKey, string>
);
const sortableColumns: Partial<Record<ColumnKey, string>> = {
  abbreviation: 'abbreviation',
  surname: 'surname',
  firstNames: 'first_names',
  initials: 'initials',
  discipline: 'discipline',
  effectiveFrom: 'effective_from',
  effectiveTo: 'effective_to',
  orcId: 'orc_id',
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

const emptyAuthorFilters: AuthorFilters = {
  q: '',
  abbreviation: '',
  surname: '',
  firstNames: '',
  discipline: '',
  legacyIdName: '',
  deleted: '',
};

const buildFilterObject = (filters: AuthorFilters) => {
  const filterObject: Record<string, string | boolean> = {};
  const trimmedQuery = filters.q.trim();
  if (trimmedQuery) filterObject.q = trimmedQuery;
  if (filters.abbreviation) filterObject.abbreviation__contains = filters.abbreviation;
  if (filters.surname) filterObject.surname__contains = filters.surname;
  if (filters.firstNames) filterObject.first_names__contains = filters.firstNames;
  if (filters.discipline) filterObject.discipline__contains = filters.discipline;
  if (filters.legacyIdName) filterObject.legacy_id_name__contains = filters.legacyIdName;
  if (filters.deleted) filterObject.deleted = filters.deleted === 'true';
  return filterObject;
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

const fetchAuthors = async (
  page: number,
  perPage: number,
  sortField: string,
  sortOrder: SortOrder,
  filters: AuthorFilters,
  retryOnAuthError = true
): Promise<AuthorsResponse> => {
  const sort = encodeURIComponent(JSON.stringify([sortField, sortOrder]));
  const range = encodeURIComponent(JSON.stringify([(page - 1) * perPage, page * perPage - 1]));
  const filterObject = buildFilterObject(filters);
  const filter = encodeURIComponent(JSON.stringify(filterObject));
  const response = await fetch(
    `${BACKEND_URL}/authors?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );
  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchAuthors(page, perPage, sortField, sortOrder, filters, false);
  }
  if (!response.ok) throw new Error(`Failed to load authors (${response.status})`);
  const rows = await response.json();
  const data = Array.isArray(rows)
    ? rows.map((row) => ({ ...row, id: row.id ?? row.author_id }))
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

const AuthorsPage = () => {
  const { canAccess: canUseDeletedFilter } = useCanAccess({
    resource: 'authors',
    action: 'deletedfilter',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = React.useMemo<AuthorFilters>(
    () => ({
      ...emptyAuthorFilters,
      q: searchParams.get('q') || '',
      abbreviation: searchParams.get('abbreviation') || '',
      surname: searchParams.get('surname') || '',
      firstNames: searchParams.get('firstNames') || '',
      discipline: searchParams.get('discipline') || '',
      legacyIdName: searchParams.get('legacyIdName') || '',
      deleted: canUseDeletedFilter ? searchParams.get('deleted') || '' : '',
    }),
    [canUseDeletedFilter, searchParams]
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
    data: AuthorRecord[];
    total: number;
  }>({ loading: true, error: null, data: [], total: 0 });

  React.useEffect(() => setDraftFilters(filters), [filters]);

  React.useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    fetchAuthors(page, perPage, sortField, sortOrder, filters)
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
  const activeFilterBadges = [
    ...(filters.q ? [{ label: 'Query', value: filters.q }] : []),
    ...(filters.abbreviation ? [{ label: 'Abbreviation', value: filters.abbreviation }] : []),
    ...(filters.surname ? [{ label: 'Surname', value: filters.surname }] : []),
    ...(filters.firstNames ? [{ label: 'First names', value: filters.firstNames }] : []),
    ...(filters.discipline ? [{ label: 'Discipline', value: filters.discipline }] : []),
    ...(filters.legacyIdName ? [{ label: 'Legacy ID name', value: filters.legacyIdName }] : []),
    ...(canUseDeletedFilter && filters.deleted ? [{ label: 'Deleted only', value: 'Yes' }] : []),
  ];

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
    updateParams({
      q: draftFilters.q || null,
      abbreviation: draftFilters.abbreviation.trim() || null,
      surname: draftFilters.surname.trim() || null,
      firstNames: draftFilters.firstNames.trim() || null,
      discipline: draftFilters.discipline || null,
      legacyIdName: draftFilters.legacyIdName.trim() || null,
      deleted: canUseDeletedFilter ? draftFilters.deleted || null : null,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setDraftFilters(emptyAuthorFilters);
    setSearchParams(new URLSearchParams());
  };

  const renderTextFilter = (
    label: string,
    key: keyof Pick<
      AuthorFilters,
      'abbreviation' | 'surname' | 'firstNames' | 'legacyIdName'
    >
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        value={draftFilters[key]}
        onChange={(event) =>
          setDraftFilters((current) => ({ ...current, [key]: event.target.value }))
        }
        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );

  const exportColumnOptions = columnOptions.filter((column) => column.key !== 'actions');

  const getExportValue = (
    column: ColumnKey,
    record: AuthorRecord,
    exportUserMap: Record<number, string>
  ) => {
    switch (column) {
      case 'abbreviation':
        return record.abbreviation ?? '';
      case 'surname':
        return record.surname ?? '';
      case 'firstNames':
        return record.first_names ?? '';
      case 'initials':
        return record.initials ?? '';
      case 'discipline':
        return record.discipline ?? '';
      case 'effectiveFrom':
        return record.effective_from ?? '';
      case 'effectiveTo':
        return record.effective_to ?? '';
      case 'orcId':
        return record.orc_id ?? '';
      case 'updatedBy':
        return record.updated_by ? exportUserMap[record.updated_by] ?? '' : '';
      case 'updated':
        return record.updated_on ?? '';
      case 'deleted':
        return renderBoolean(record.deleted);
      default:
        return '';
    }
  };

  const buildExportCsv = (records: AuthorRecord[], exportUserMap: Record<number, string>) =>
    [
      exportColumnOptions.map((column) => column.label),
      ...records.map((record) =>
        exportColumnOptions.map((column) => getExportValue(column.key, record, exportUserMap))
      ),
    ]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');

  const handleExport = async () => {
    if (isExporting || state.total === 0) return;
    try {
      setIsExporting(true);
      const exportPages = Math.max(Math.ceil(state.total / EXPORT_BATCH_SIZE), 1);
      const allRecords: AuthorRecord[] = [];
      for (let currentPage = 1; currentPage <= exportPages; currentPage += 1) {
        const result = await fetchAuthors(currentPage, EXPORT_BATCH_SIZE, sortField, sortOrder, filters);
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
      downloadCsv(`authors_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCellContent = (column: ColumnKey, record: AuthorRecord) => {
    const authorId = record.author_id ?? record.id ?? 0;
    switch (column) {
      case 'abbreviation':
        return (
          <span className="inline-flex items-center gap-2">
            <span>{formatAuthorOption(record)}</span>
            {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
          </span>
        );
      case 'surname':
        return record.surname ?? '';
      case 'firstNames':
        return record.first_names ?? '';
      case 'initials':
        return record.initials ?? '';
      case 'discipline':
        return record.discipline ?? '';
      case 'effectiveFrom':
        return <span className="text-muted-foreground">{formatDate(record.effective_from)}</span>;
      case 'effectiveTo':
        return <span className="text-muted-foreground">{formatDate(record.effective_to)}</span>;
      case 'orcId':
        return record.orc_id ?? '';
      case 'updatedBy':
        return (record.updated_by && userMap[record.updated_by]) || '';
      case 'updated':
        return <span className="text-muted-foreground">{formatDate(record.updated_on)}</span>;
      case 'deleted':
        return renderBoolean(record.deleted);
      case 'actions':
        return (
          <RecordActionButtons
            resource="authors"
            showTo={`/authors/${authorId}/show`}
            editTo={`/authors/${authorId}`}
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
            <h1 className="text-2xl font-semibold tracking-tight">Authors</h1>
            <Badge variant="outline">{state.total} result{state.total === 1 ? '' : 's'}</Badge>
            {activeFilterBadges.map((filter) => (
              <Badge key={`${filter.label}:${filter.value}`} variant="outline">
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
          <AuthorizedButtonLink resource="authors" action="create" to="/authors/create" variant="outline">
            <Plus className="h-4 w-4" />
            Create
          </AuthorizedButtonLink>
          <ColumnsButton resource="authors" storeKey={TABLE_STORE_KEY} />
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
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, q: event.target.value }))
                }
                placeholder="Search authors"
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="grid gap-4">
            {renderTextFilter('Abbreviation', 'abbreviation')}
            {renderTextFilter('Surname', 'surname')}
            {renderTextFilter('First names', 'firstNames')}
            <div className="space-y-2">
              <label className="text-sm font-medium">Discipline</label>
              <select
                value={draftFilters.discipline}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, discipline: event.target.value }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any discipline</option>
                {AuthorDiscipline.map((discipline) => (
                  <option key={discipline.id} value={discipline.id}>
                    {discipline.name}
                  </option>
                ))}
              </select>
            </div>
            {renderTextFilter('Legacy ID name', 'legacyIdName')}
          </div>
          {canUseDeletedFilter ? (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={draftFilters.deleted === 'true'}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    deleted: event.target.checked ? 'true' : '',
                  }))
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              Show deleted only
            </label>
          ) : null}
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
          <DataTable<AuthorRecord>
            resource="authors"
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
              <DataTable.Col<AuthorRecord>
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
                <label htmlFor="authors-per-page" className="text-sm text-muted-foreground">
                  Rows
                </label>
                <select
                  id="authors-per-page"
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

export default AuthorsPage;
