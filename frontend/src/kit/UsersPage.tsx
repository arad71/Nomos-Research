import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnsButton } from '@/components/admin/columns-button';
import { DataTable } from '@/components/admin/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import authProvider from '../admin/authProvider';
import AuthorizedButtonLink from './AuthorizedButtonLink';
import RecordActionButtons from './RecordActionButtons';
import { BACKEND_URL } from '../config';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

type SortOrder = 'ASC' | 'DESC';

type UserRecord = {
  id?: number;
  user_id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  role_ids?: number[];
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type UsersResponse = {
  data: UserRecord[];
  total: number;
};

type UserFilters = {
  q: string;
  deleted: string;
};

type ColumnKey =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'roles'
  | 'updatedBy'
  | 'updated'
  | 'deleted'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'users.kit.datatable';
const DEFAULT_SORT_FIELD = 'updated_on';
const DEFAULT_SORT_ORDER: SortOrder = 'DESC';
const EXPORT_BATCH_SIZE = 500;

const defaultColumns: ColumnKey[] = [
  'email',
  'firstName',
  'lastName',
  'roles',
  'actions',
];
const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'roles', label: 'User roles' },
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
  email: 'email',
  firstName: 'first_name',
  lastName: 'last_name',
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

const fetchUsers = async (
  page: number,
  perPage: number,
  sortField: string,
  sortOrder: SortOrder,
  filters: UserFilters,
  retryOnAuthError = true
): Promise<UsersResponse> => {
  const sort = encodeURIComponent(JSON.stringify([sortField, sortOrder]));
  const range = encodeURIComponent(JSON.stringify([(page - 1) * perPage, page * perPage - 1]));
  const nextFilter: Record<string, string | boolean> = {};
  if (filters.q) {
    nextFilter.q = filters.q;
  }
  if (filters.deleted) {
    nextFilter.deleted = filters.deleted === 'true';
  }
  const filter = encodeURIComponent(JSON.stringify(nextFilter));
  const response = await fetch(
    `${BACKEND_URL}/users?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );
  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchUsers(page, perPage, sortField, sortOrder, filters, false);
  }
  if (!response.ok) throw new Error(`Failed to load users (${response.status})`);
  const rows = await response.json();
  const data = Array.isArray(rows)
    ? rows.map((row) => ({ ...row, id: row.id ?? row.user_id }))
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

const UsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [canUseDeletedFilter, setCanUseDeletedFilter] = React.useState(false);
  const filters = React.useMemo<UserFilters>(
    () => ({
      q: searchParams.get('q') || '',
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
    searchParams.get('sortOrder') === 'ASC' ? 'ASC' : DEFAULT_SORT_ORDER;
  const [draftFilters, setDraftFilters] = React.useState(filters);
  const [roleMap, setRoleMap] = React.useState<Record<number, string>>({});
  const [userMap, setUserMap] = React.useState<Record<number, string>>({});
  const [isExporting, setIsExporting] = React.useState(false);
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string | null;
    data: UserRecord[];
    total: number;
  }>({ loading: true, error: null, data: [], total: 0 });

  React.useEffect(() => {
    let active = true;
    authProvider
      .canAccess({ resource: 'users', action: 'deletedfilter' })
      .then((result) => {
        if (active) {
          setCanUseDeletedFilter(Boolean(result));
        }
      })
      .catch(() => {
        if (active) {
          setCanUseDeletedFilter(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => setDraftFilters(filters), [filters]);

  React.useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    fetchUsers(page, perPage, sortField, sortOrder, filters)
      .then((result) => active && setState({ loading: false, error: null, data: result.data, total: result.total }))
      .catch((error: Error) => active && setState({ loading: false, error: error.message, data: [], total: 0 }));
    return () => {
      active = false;
    };
  }, [filters, page, perPage, sortField, sortOrder]);

  React.useEffect(() => {
    const roleIds = Array.from(
      new Set(
        state.data
          .flatMap((record) => record.role_ids ?? [])
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
      fetchReferenceMap('roles', roleIds, 'role_id', 'name'),
      fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
    ]).then(([nextRoleMap, nextUserMap]) => {
      setRoleMap(nextRoleMap);
      setUserMap(nextUserMap);
    });
  }, [state.data]);

  const totalPages = Math.max(Math.ceil(state.total / perPage), 1);
  const activeFilterBadges = [
    ...(filters.q ? [{ label: 'Query', value: filters.q }] : []),
    ...(canUseDeletedFilter && filters.deleted
      ? [{ label: 'Deleted only', value: 'Yes' }]
      : []),
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
      deleted: canUseDeletedFilter ? draftFilters.deleted || null : null,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setDraftFilters({ q: '', deleted: '' });
    setSearchParams(new URLSearchParams());
  };

  const renderRoles = (roleIds?: number[]) =>
    (roleIds ?? [])
      .map((roleId) => roleMap[roleId])
      .filter(Boolean)
      .join(', ');

  const buildExportCsv = (
    records: UserRecord[],
    exportRoleMap: Record<number, string>,
    exportUserMap: Record<number, string>
  ) =>
    [
      ['User ID', 'Email', 'First name', 'Last name', 'Roles', 'Updated by', 'Updated', 'Deleted'],
      ...records.map((record) => [
        record.user_id ?? record.id ?? '',
        record.email ?? '',
        record.first_name ?? '',
        record.last_name ?? '',
        (record.role_ids ?? []).map((roleId) => exportRoleMap[roleId]).filter(Boolean).join(', '),
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
      const allRecords: UserRecord[] = [];
      for (let currentPage = 1; currentPage <= exportPages; currentPage += 1) {
        const result = await fetchUsers(currentPage, EXPORT_BATCH_SIZE, sortField, sortOrder, filters);
        allRecords.push(...result.data);
      }
      const roleIds = Array.from(
        new Set(
          allRecords
            .flatMap((record) => record.role_ids ?? [])
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
      const [exportRoleMap, exportUserMap] = await Promise.all([
        fetchReferenceMap('roles', roleIds, 'role_id', 'name'),
        fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
      ]);
      const csv = buildExportCsv(allRecords, exportRoleMap, exportUserMap);
      downloadCsv(`users_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCellContent = (column: ColumnKey, record: UserRecord) => {
    const userId = record.user_id ?? record.id ?? 0;
    switch (column) {
      case 'email':
        return (
          <span className="inline-flex items-center gap-2">
            <span>{record.email ?? ''}</span>
            {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
          </span>
        );
      case 'firstName':
        return record.first_name ?? '';
      case 'lastName':
        return record.last_name ?? '';
      case 'roles':
        return renderRoles(record.role_ids);
      case 'updatedBy':
        return (record.updated_by && userMap[record.updated_by]) || '';
      case 'updated':
        return <span className="text-muted-foreground">{formatDate(record.updated_on)}</span>;
      case 'deleted':
        return renderBoolean(record.deleted);
      case 'actions':
        return (
          <RecordActionButtons
            resource="users"
            showTo={`/users/${userId}/show`}
            editTo={`/users/${userId}`}
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
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
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
          <AuthorizedButtonLink resource="users" action="create" to="/users/create" variant="outline">
            <Plus className="h-4 w-4" />
            Create
          </AuthorizedButtonLink>
          <ColumnsButton resource="users" storeKey={TABLE_STORE_KEY} />
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
                  setDraftFilters((current) => ({
                    ...current,
                    q: event.target.value,
                  }))
                }
                placeholder="Search users"
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          {canUseDeletedFilter ? (
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={draftFilters.deleted === 'true'}
                  onCheckedChange={(checked) =>
                    setDraftFilters((current) => ({
                      ...current,
                      deleted: checked ? 'true' : '',
                    }))
                  }
                />
                Show deleted only
              </label>
            </div>
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
          <DataTable<UserRecord>
            resource="users"
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
              <DataTable.Col<UserRecord>
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
                <label htmlFor="users-per-page" className="text-sm text-muted-foreground">
                  Rows
                </label>
                <select
                  id="users-per-page"
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

export default UsersPage;
