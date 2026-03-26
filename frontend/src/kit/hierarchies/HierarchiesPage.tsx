import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnsButton } from '@/components/admin/columns-button';
import { DataTable } from '@/components/admin/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import authProvider from '../app/authProvider';
import AuthorizedButtonLink from '../shared/AuthorizedButtonLink';
import RecordActionButtons from '../shared/RecordActionButtons';
import TaxonRank from '../shared/choices/TaxonRank';
import { BACKEND_URL } from '../../config';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

type SortOrder = 'ASC' | 'DESC';

type HierarchyRecord = {
  id?: number;
  hierarchy_id?: number;
  taxon_name_id?: number;
  parent_nid?: number;
  classification_system_id?: number;
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type HierarchiesResponse = {
  data: HierarchyRecord[];
  total: number;
};

type HierarchyFilters = {
  q: string;
  higherClassification: string;
  parentName: string;
  taxonName: string;
  parentRank: string;
  taxonRank: string;
  classificationSystemId: string;
  deleted: string;
};

type ColumnKey =
  | 'taxonName'
  | 'parentName'
  | 'classificationSystem'
  | 'updatedBy'
  | 'updated'
  | 'deleted'
  | 'actions';

type ClassificationSystemOption = {
  id: number;
  class_desc: string;
};

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'hierarchies.kit.datatable';
const DEFAULT_SORT_FIELD = 'path';
const DEFAULT_SORT_ORDER: SortOrder = 'ASC';
const EXPORT_BATCH_SIZE = 500;

const defaultColumns: ColumnKey[] = [
  'taxonName',
  'parentName',
  'classificationSystem',
  'actions',
];

const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'taxonName', label: 'Taxon name' },
  { key: 'parentName', label: 'Parent name' },
  { key: 'classificationSystem', label: 'Classification system' },
  { key: 'updatedBy', label: 'Updated by' },
  { key: 'updated', label: 'Updated' },
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
  taxonName: 'taxon_name___scientific_name',
  parentName: 'parent___scientific_name',
  classificationSystem: 'classification_system___class_desc',
  updatedBy: 'updated_by',
  updated: 'updated_on',
  deleted: 'deleted',
};

const getColumnSource = (column: ColumnKey) => sortableColumns[column] ?? column;
const defaultHiddenColumns = columnOptions
  .map((column) => column.key)
  .filter((key) => !defaultColumns.includes(key))
  .map(getColumnSource);

const booleanOptions = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

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

const buildFilterObject = (filters: HierarchyFilters) => {
  const nextFilter: Record<string, string | boolean | number> = {};

  if (filters.q) nextFilter.q = filters.q;
  if (filters.higherClassification) {
    nextFilter.path__ltxtquery = filters.higherClassification;
  }
  if (filters.parentName) {
    nextFilter.parent___scientific_name__contains = filters.parentName;
  }
  if (filters.taxonName) {
    nextFilter.taxon_name___scientific_name__contains = filters.taxonName;
  }
  if (filters.parentRank) {
    nextFilter.parent_name___taxon_rank___rank_name = filters.parentRank;
  }
  if (filters.taxonRank) {
    nextFilter.taxon_name___taxon_rank___rank_name = filters.taxonRank;
  }
  if (filters.classificationSystemId) {
    nextFilter.classification_system___classification_system_id = Number(
      filters.classificationSystemId
    );
  }
  if (filters.deleted) {
    nextFilter.deleted = filters.deleted === 'true';
  }

  return nextFilter;
};

const fetchHierarchies = async (
  page: number,
  perPage: number,
  sortField: string,
  sortOrder: SortOrder,
  filters: HierarchyFilters,
  retryOnAuthError = true
): Promise<HierarchiesResponse> => {
  const sort = encodeURIComponent(JSON.stringify([sortField, sortOrder]));
  const range = encodeURIComponent(
    JSON.stringify([(page - 1) * perPage, page * perPage - 1])
  );
  const filter = encodeURIComponent(JSON.stringify(buildFilterObject(filters)));

  const response = await fetch(
    `${BACKEND_URL}/hierarchies?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );

  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchHierarchies(page, perPage, sortField, sortOrder, filters, false);
  }

  if (!response.ok) {
    throw new Error(`Failed to load hierarchies (${response.status})`);
  }

  const rows = await response.json();
  const data = Array.isArray(rows)
    ? rows.map((row) => ({
        ...row,
        id: row.id ?? row.hierarchy_id,
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

const fetchClassificationSystems = async (retryOnAuthError = true) => {
  const sort = encodeURIComponent(JSON.stringify(['class_desc', 'ASC']));
  const range = encodeURIComponent(JSON.stringify([0, 250]));
  const filter = encodeURIComponent(JSON.stringify({ class_type: 'hierarchical' }));
  const response = await fetch(
    `${BACKEND_URL}/classification_systems?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );

  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchClassificationSystems(false);
  }

  if (!response.ok) {
    return [] as ClassificationSystemOption[];
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    return [] as ClassificationSystemOption[];
  }

  return rows.map((row) => ({
    id: Number(row.classification_system_id ?? row.id),
    class_desc: String(row.class_desc ?? ''),
  }));
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

const HierarchiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [canUseDeletedFilter, setCanUseDeletedFilter] = React.useState(false);
  const [classificationSystems, setClassificationSystems] = React.useState<
    ClassificationSystemOption[]
  >([]);
  const filters = React.useMemo<HierarchyFilters>(
    () => ({
      q: searchParams.get('q') || '',
      higherClassification: searchParams.get('higher_classification') || '',
      parentName: searchParams.get('parent_name') || '',
      taxonName: searchParams.get('taxon_name') || '',
      parentRank: searchParams.get('parent_rank') || '',
      taxonRank: searchParams.get('taxon_rank') || '',
      classificationSystemId: searchParams.get('classification_system_id') || '',
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
  const [taxonNameMap, setTaxonNameMap] = React.useState<Record<number, string>>({});
  const [classificationSystemMap, setClassificationSystemMap] = React.useState<
    Record<number, string>
  >({});
  const [userMap, setUserMap] = React.useState<Record<number, string>>({});
  const [isExporting, setIsExporting] = React.useState(false);
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string | null;
    data: HierarchyRecord[];
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
      .canAccess({ resource: 'hierarchies', action: 'deletedfilter' })
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
    fetchClassificationSystems().then((result) => {
      setClassificationSystems(result);
      setClassificationSystemMap(
        result.reduce<Record<number, string>>((acc, item) => {
          acc[item.id] = item.class_desc;
          return acc;
        }, {})
      );
    });
  }, []);

  React.useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  React.useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    fetchHierarchies(page, perPage, sortField, sortOrder, filters)
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
          .flatMap((record) => [record.taxon_name_id, record.parent_nid])
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
        filters.higherClassification
          ? { label: 'Higher classification', value: filters.higherClassification }
          : null,
        filters.parentName ? { label: 'Parent name', value: filters.parentName } : null,
        filters.taxonName ? { label: 'Taxon name', value: filters.taxonName } : null,
        filters.parentRank ? { label: 'Parent rank', value: filters.parentRank } : null,
        filters.taxonRank ? { label: 'Taxon rank', value: filters.taxonRank } : null,
        filters.classificationSystemId
          ? {
              label: 'Classification system',
              value:
                classificationSystemMap[Number(filters.classificationSystemId)] ||
                filters.classificationSystemId,
            }
          : null,
        canUseDeletedFilter && filters.deleted
          ? { label: 'Deleted only', value: 'Yes' }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [canUseDeletedFilter, filters, classificationSystemMap]
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
      higher_classification: draftFilters.higherClassification || null,
      parent_name: draftFilters.parentName || null,
      taxon_name: draftFilters.taxonName || null,
      parent_rank: draftFilters.parentRank || null,
      taxon_rank: draftFilters.taxonRank || null,
      classification_system_id: draftFilters.classificationSystemId || null,
      deleted: canUseDeletedFilter ? draftFilters.deleted || null : null,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setDraftFilters({
      q: '',
      higherClassification: '',
      parentName: '',
      taxonName: '',
      parentRank: '',
      taxonRank: '',
      classificationSystemId: '',
      deleted: '',
    });
    setSearchParams(new URLSearchParams());
  };

  const buildExportCsv = (records: HierarchyRecord[]) => {
    const headers = [
      'Hierarchy ID',
      'Taxon name',
      'Parent name',
      'Classification system',
      'Updated by',
      'Updated',
      'Deleted',
    ];

    const rows = records.map((record) => [
      record.hierarchy_id ?? record.id ?? '',
      record.taxon_name_id ? taxonNameMap[record.taxon_name_id] ?? '' : '',
      record.parent_nid ? taxonNameMap[record.parent_nid] ?? '' : '',
      record.classification_system_id
        ? classificationSystemMap[record.classification_system_id] ?? ''
        : '',
      record.updated_by ? userMap[record.updated_by] ?? '' : '',
      record.updated_on ?? '',
      record.deleted === undefined ? '' : record.deleted ? 'Yes' : 'No',
    ]);

    return [headers, ...rows]
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
      const allRecords: HierarchyRecord[] = [];

      for (let currentPage = 1; currentPage <= exportPages; currentPage += 1) {
        const result = await fetchHierarchies(
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
            .flatMap((record) => [record.taxon_name_id, record.parent_nid])
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

      const previousTaxonNameMap = taxonNameMap;
      const previousUserMap = userMap;
      setTaxonNameMap(nextTaxonNameMap);
      setUserMap(nextUserMap);
      const csv = buildExportCsv(allRecords);
      setTaxonNameMap(previousTaxonNameMap);
      setUserMap(previousUserMap);

      const dateStamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`hierarchies_${dateStamp}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCellContent = (column: ColumnKey, record: HierarchyRecord) => {
    const hierarchyId = record.hierarchy_id ?? record.id ?? 0;

    switch (column) {
      case 'taxonName':
        return (
          <span className="inline-flex items-center gap-2">
            <span>
              {renderHtmlOrFallback(
                record.taxon_name_id ? taxonNameMap[record.taxon_name_id] : undefined
              )}
            </span>
            {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
          </span>
        );
      case 'parentName':
        return renderHtmlOrFallback(
          record.parent_nid ? taxonNameMap[record.parent_nid] : undefined
        );
      case 'classificationSystem':
        return record.classification_system_id
          ? classificationSystemMap[record.classification_system_id] || ''
          : '';
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
            resource="hierarchies"
            showTo={`/hierarchies/${hierarchyId}/show`}
            editTo={`/hierarchies/${hierarchyId}`}
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
            <h1 className="text-2xl font-semibold tracking-tight">Hierarchies</h1>
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
          <AuthorizedButtonLink resource="hierarchies" action="create" to="/hierarchies/create" variant="outline">
            <Plus className="h-4 w-4" />
            Create
          </AuthorizedButtonLink>
          <ColumnsButton resource="hierarchies" storeKey={TABLE_STORE_KEY} />
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
                  placeholder="Search hierarchies"
                  className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Higher classification</label>
              <input
                value={draftFilters.higherClassification}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    higherClassification: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Parent name</label>
              <input
                value={draftFilters.parentName}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    parentName: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Taxon name</label>
              <input
                value={draftFilters.taxonName}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    taxonName: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent rank</label>
                <select
                  value={draftFilters.parentRank}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      parentRank: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Any rank</option>
                  {TaxonRank.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Taxon rank</label>
                <select
                  value={draftFilters.taxonRank}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      taxonRank: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Any rank</option>
                  {TaxonRank.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Classification system</label>
              <select
                value={draftFilters.classificationSystemId}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    classificationSystemId: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any classification system</option>
                {classificationSystems.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.class_desc}
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

          <DataTable<HierarchyRecord>
            resource="hierarchies"
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
              <DataTable.Col<HierarchyRecord>
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
                  htmlFor="hierarchies-per-page"
                  className="text-sm text-muted-foreground"
                >
                  Rows
                </label>
                <select
                  id="hierarchies-per-page"
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

export default HierarchiesPage;
