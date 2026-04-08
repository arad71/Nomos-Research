import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnsButton } from '@/components/admin/columns-button';
import { DataTable } from '@/components/admin/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import authProvider from '../app/authProvider';
import AuthorizedButtonLink from '../shared/AuthorizedButtonLink';
import RecordActionButtons from '../shared/RecordActionButtons';
import CrossRefType from '../shared/choices/CrossRefType';
import { BACKEND_URL } from '../../config';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

type SortOrder = 'ASC' | 'DESC';

type CrossReferenceRecord = {
  id?: number;
  cross_reference_id?: number;
  old_name_id?: number;
  new_name_id?: number;
  cross_reference_type?: string;
  authorised_by?: string;
  authorised_on?: string;
  contributed_by?: string;
  contributed_on?: string;
  reference_comments?: string;
  notes?: string;
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type CrossReferencesResponse = {
  data: CrossReferenceRecord[];
  total: number;
};

type CrossReferenceFilters = {
  q: string;
  crossReferenceType: string;
  deleted: string;
};

type ColumnKey =
  | 'oldName'
  | 'newName'
  | 'type'
  | 'authorisedBy'
  | 'authorisedOn'
  | 'contributedBy'
  | 'contributedOn'
  | 'referenceComments'
  | 'notes'
  | 'updatedBy'
  | 'updated'
  | 'deleted'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'cross_references.kit.datatable';
const DEFAULT_SORT_FIELD = 'updated_on';
const DEFAULT_SORT_ORDER: SortOrder = 'DESC';
const EXPORT_BATCH_SIZE = 500;

const defaultColumns: ColumnKey[] = [
  'type',
  'oldName',
  'newName',
  'actions',
];

const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'type', label: 'Cross reference type' },
  { key: 'oldName', label: 'Old name' },
  { key: 'newName', label: 'New name' },
  { key: 'authorisedBy', label: 'Authorised by' },
  { key: 'authorisedOn', label: 'Authorised on' },
  { key: 'contributedBy', label: 'Contributed by' },
  { key: 'contributedOn', label: 'Contributed on' },
  { key: 'referenceComments', label: 'Reference comments' },
  { key: 'notes', label: 'Notes' },
  { key: 'updatedBy', label: 'Updated by' },
  { key: 'updated', label: 'Updated on' },
  { key: 'deleted', label: 'Deleted' },
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
  oldName: 'old_name___scientific_name',
  newName: 'new_name___scientific_name',
  type: 'cross_reference_type',
  authorisedBy: 'authorised_by',
  authorisedOn: 'authorised_on',
  contributedBy: 'contributed_by',
  contributedOn: 'contributed_on',
  referenceComments: 'reference_comments',
  notes: 'notes',
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
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

const parseTotal = (response: Response, rows: unknown[]) => {
  const contentRange = response.headers.get('content-range');
  if (contentRange) {
    const total = Number(contentRange.split('/').pop());
    if (!Number.isNaN(total)) {
      return total;
    }
  }
  return rows.length;
};

const buildFilterObject = (filters: CrossReferenceFilters) => {
  const nextFilter: Record<string, string | boolean> = {};

  if (filters.q) nextFilter.q = filters.q;
  if (filters.crossReferenceType) {
    nextFilter.cross_reference_type = filters.crossReferenceType;
  }
  if (filters.deleted) {
    nextFilter.deleted = filters.deleted === 'true';
  }

  return nextFilter;
};

const fetchCrossReferences = async (
  page: number,
  perPage: number,
  sortField: string,
  sortOrder: SortOrder,
  filters: CrossReferenceFilters,
  retryOnAuthError = true
): Promise<CrossReferencesResponse> => {
  const sort = encodeURIComponent(JSON.stringify([sortField, sortOrder]));
  const range = encodeURIComponent(
    JSON.stringify([(page - 1) * perPage, page * perPage - 1])
  );
  const filter = encodeURIComponent(JSON.stringify(buildFilterObject(filters)));

  const response = await fetch(
    `${BACKEND_URL}/cross_references?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );

  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchCrossReferences(page, perPage, sortField, sortOrder, filters, false);
  }

  if (!response.ok) {
    throw new Error(`Failed to load related names (${response.status})`);
  }

  const rows = await response.json();
  const data = Array.isArray(rows)
    ? rows.map((row) => ({
        ...row,
        id: row.id ?? row.cross_reference_id,
      }))
    : [];

  return {
    data,
    total: parseTotal(response, data),
  };
};

const fetchReferenceMap = async (
  resource: string,
  ids: number[],
  idField: string,
  labelField: string,
  retryOnAuthError = true
) => {
  if (!ids.length) {
    return {} as Record<number, string>;
  }

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

  if (!response.ok) {
    return {};
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    return {};
  }

  return rows.reduce((acc: Record<number, string>, row: Record<string, unknown>) => {
    const key = Number(row[idField] ?? row.id);
    const value = String(row[labelField] ?? '');
    if (!Number.isNaN(key) && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const formatDate = (value?: string) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

const renderHtmlOrFallback = (value?: string, fallback = '') => {
  if (!value) {
    return fallback;
  }

  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const textOrEmpty = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? '' : String(value);

const booleanOrEmpty = (value?: boolean) =>
  value === undefined ? '' : value ? 'Yes' : 'No';

const escapeCsvValue = (value: string | number | boolean | null | undefined) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
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

const crossRefTypeMap = CrossRefType.reduce<Record<string, string>>((acc, option) => {
  acc[option.id] = option.name;
  return acc;
}, {});

const booleanOptions = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

const CrossReferencesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [canUseDeletedFilter, setCanUseDeletedFilter] = React.useState(false);
  const filters = React.useMemo<CrossReferenceFilters>(
    () => ({
      q: searchParams.get('q') || '',
      crossReferenceType: searchParams.get('cross_reference_type') || '',
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
  const [taxonNameMap, setTaxonNameMap] = React.useState<Record<number, string>>({});
  const [userMap, setUserMap] = React.useState<Record<number, string>>({});
  const [isExporting, setIsExporting] = React.useState(false);
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string | null;
    data: CrossReferenceRecord[];
    total: number;
  }>({
    loading: true,
    error: null,
    data: [],
    total: 0,
  });

  React.useEffect(() => {
    let active = true;
    authProvider
      .canAccess({ resource: 'cross_references', action: 'deletedfilter' })
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

  React.useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  React.useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    fetchCrossReferences(page, perPage, sortField, sortOrder, filters)
      .then((result) => {
        if (!active) {
          return;
        }
        setState({
          loading: false,
          error: null,
          data: result.data,
          total: result.total,
        });
      })
      .catch((error: Error) => {
        if (!active) {
          return;
        }
        setState({
          loading: false,
          error: error.message,
          data: [],
          total: 0,
        });
      });

    return () => {
      active = false;
    };
  }, [filters, page, perPage, sortField, sortOrder]);

  React.useEffect(() => {
    const taxonNameIds = Array.from(
      new Set(
        state.data
          .flatMap((record) => [record.old_name_id, record.new_name_id])
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

    let active = true;

    Promise.all([
      fetchReferenceMap('taxon_names', taxonNameIds, 'taxon_name_id', 'formatted_scientific_name'),
      fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
    ]).then(([taxonNames, users]) => {
      if (!active) {
        return;
      }
      setTaxonNameMap(taxonNames);
      setUserMap(users);
    });

    return () => {
      active = false;
    };
  }, [state.data]);

  const totalPages = Math.max(Math.ceil(state.total / perPage), 1);

  const activeFilterBadges = React.useMemo(
    () =>
      [
        filters.q ? { label: 'Query', value: filters.q } : null,
        filters.crossReferenceType
          ? {
              label: 'Cross reference type',
              value:
                crossRefTypeMap[filters.crossReferenceType] || filters.crossReferenceType,
            }
          : null,
        canUseDeletedFilter && filters.deleted
          ? { label: 'Deleted only', value: 'Yes' }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [canUseDeletedFilter, filters]
  );

  const updateParams = (updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      q: draftFilters.q || null,
      cross_reference_type: draftFilters.crossReferenceType || null,
      deleted: canUseDeletedFilter ? draftFilters.deleted || null : null,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setDraftFilters({
      q: '',
      crossReferenceType: '',
      deleted: '',
    });
    setSearchParams(new URLSearchParams());
  };

  const exportColumnOptions = columnOptions.filter((column) => column.key !== 'actions');

  const getExportValue = (
    column: ColumnKey,
    record: CrossReferenceRecord,
    exportTaxonNameMap: Record<number, string>,
    exportUserMap: Record<number, string>
  ) => {
    switch (column) {
      case 'oldName':
        return record.old_name_id ? exportTaxonNameMap[record.old_name_id] ?? '' : '';
      case 'newName':
        return record.new_name_id ? exportTaxonNameMap[record.new_name_id] ?? '' : '';
      case 'crossReferenceType':
        return record.cross_reference_type
          ? crossRefTypeMap[record.cross_reference_type] ?? record.cross_reference_type
          : '';
      case 'authorisedBy':
        return record.authorised_by ?? '';
      case 'authorisedOn':
        return record.authorised_on ?? '';
      case 'contributedBy':
        return record.contributed_by ?? '';
      case 'contributedOn':
        return record.contributed_on ?? '';
      case 'referenceComments':
        return record.reference_comments ?? '';
      case 'notes':
        return record.notes ?? '';
      case 'updatedBy':
        return record.updated_by ? exportUserMap[record.updated_by] ?? '' : '';
      case 'updated':
        return record.updated_on ?? '';
      case 'deleted':
        return record.deleted === undefined ? '' : record.deleted ? 'Yes' : 'No';
      default:
        return '';
    }
  };

  const buildExportCsv = (
    records: CrossReferenceRecord[],
    exportTaxonNameMap: Record<number, string>,
    exportUserMap: Record<number, string>
  ) => {
    const rows = records.map((record) =>
      exportColumnOptions.map((column) =>
        getExportValue(column.key, record, exportTaxonNameMap, exportUserMap)
      )
    );

    return [exportColumnOptions.map((column) => column.label), ...rows]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');
  };

  const handleExport = async () => {
    if (isExporting || state.total === 0) {
      return;
    }

    try {
      setIsExporting(true);
      const exportPages = Math.max(Math.ceil(state.total / EXPORT_BATCH_SIZE), 1);
      const allRecords: CrossReferenceRecord[] = [];

      for (let currentPage = 1; currentPage <= exportPages; currentPage += 1) {
        const result = await fetchCrossReferences(
          currentPage,
          EXPORT_BATCH_SIZE,
          sortField,
          sortOrder,
          filters
        );
        allRecords.push(...result.data);
      }

      const taxonNameIds = Array.from(
        new Set(
          allRecords
            .flatMap((record) => [record.old_name_id, record.new_name_id])
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

      const [nextTaxonNameMap, nextUserMap] = await Promise.all([
        fetchReferenceMap('taxon_names', taxonNameIds, 'taxon_name_id', 'formatted_scientific_name'),
        fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
      ]);

      const csv = buildExportCsv(allRecords, nextTaxonNameMap, nextUserMap);

      const dateStamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`cross_references_${dateStamp}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCellContent = (column: ColumnKey, record: CrossReferenceRecord) => {
    const crossReferenceId = record.cross_reference_id ?? record.id ?? 0;

    switch (column) {
      case 'oldName':
        return (
          <span className="inline-flex items-center gap-2">
            <span>
              {renderHtmlOrFallback(
                record.old_name_id ? taxonNameMap[record.old_name_id] : undefined
              )}
            </span>
            {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
          </span>
        );
      case 'newName':
        return renderHtmlOrFallback(
          record.new_name_id ? taxonNameMap[record.new_name_id] : undefined
        );
      case 'type':
        return record.cross_reference_type
          ? crossRefTypeMap[record.cross_reference_type] ?? record.cross_reference_type
          : '';
      case 'authorisedBy':
        return textOrEmpty(record.authorised_by);
      case 'authorisedOn':
        return (
          <span className="text-muted-foreground">{formatDate(record.authorised_on)}</span>
        );
      case 'contributedBy':
        return textOrEmpty(record.contributed_by);
      case 'contributedOn':
        return (
          <span className="text-muted-foreground">{formatDate(record.contributed_on)}</span>
        );
      case 'referenceComments':
        return textOrEmpty(record.reference_comments);
      case 'notes':
        return textOrEmpty(record.notes);
      case 'updatedBy':
        return (record.updated_by && userMap[record.updated_by]) ||
          (record.updated_by ? `User ${record.updated_by}` : '');
      case 'updated':
        return (
          <span className="text-muted-foreground">{formatDate(record.updated_on)}</span>
        );
      case 'deleted':
        return booleanOrEmpty(record.deleted);
      case 'actions':
        return (
          <RecordActionButtons
            resource="cross_references"
            showTo={`/cross_references/${crossReferenceId}/show`}
            editTo={`/cross_references/${crossReferenceId}`}
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
            <h1 className="text-2xl font-semibold tracking-tight">Related names</h1>
            <Badge variant="outline">
              {state.total} result{state.total === 1 ? '' : 's'}
            </Badge>
            {activeFilterBadges.length > 0 ? (
              <Badge variant="secondary">
                {activeFilterBadges.length} active filter
                {activeFilterBadges.length === 1 ? '' : 's'}
              </Badge>
            ) : null}
            {activeFilterBadges.map((filter) => (
              <Badge key={`${filter.label}-${filter.value}`} variant="outline">
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
          <AuthorizedButtonLink resource="cross_references" action="create" to="/cross_references/create" variant="outline">
            <Plus className="h-4 w-4" />
            Create
          </AuthorizedButtonLink>
          <ColumnsButton resource="cross_references" storeKey={TABLE_STORE_KEY} />
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
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={draftFilters.q}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, q: event.target.value }))
                  }
                  placeholder="Search related names"
                  className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cross reference type</label>
              <select
                value={draftFilters.crossReferenceType}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    crossReferenceType: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any type</option>
                {CrossRefType.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {canUseDeletedFilter ? <div className="space-y-2">
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
            </div> : null}
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

          <DataTable<CrossReferenceRecord>
            resource="cross_references"
            storeKey={TABLE_STORE_KEY}
            hiddenColumns={defaultHiddenColumns}
            data={state.data}
            total={state.total}
            isPending={state.loading}
            isLoading={state.loading}
            rowClick={false}
            sort={{ field: sortField, order: sortOrder }}
            setSort={(sort) =>
              updateParams({
                sortField: sort.field,
                sortOrder: sort.order as SortOrder,
                page: 1,
              })
            }
            bulkActionButtons={false}
          >
            {columnOptions.map((column) => (
              <DataTable.Col<CrossReferenceRecord>
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
                  htmlFor="cross-references-per-page"
                  className="text-sm text-muted-foreground"
                >
                  Rows
                </label>
                <select
                  id="cross-references-per-page"
                  value={perPage}
                  onChange={(event) =>
                    updateParams({
                      perPage: Number(event.target.value),
                      page: 1,
                    })
                  }
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

export default CrossReferencesPage;
