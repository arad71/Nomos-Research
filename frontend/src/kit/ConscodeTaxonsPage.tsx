import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnsButton } from '@/components/admin/columns-button';
import { DataTable } from '@/components/admin/data-table';
import authProvider from '../admin/authProvider';
import AuthorizedButtonLink from './AuthorizedButtonLink';
import RecordActionButtons from './RecordActionButtons';
import ConservationType from '../admin/Conservation_codes/ConservationType';
import { BACKEND_URL } from '../config';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

type SortOrder = 'ASC' | 'DESC';

type ConscodeTaxonRecord = {
  id?: number;
  conscode_taxon_id?: number;
  taxon_name_id?: number;
  conservation_code_id?: number;
  effective_from?: string;
  effective_to?: string;
  notes?: string;
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type ReferenceRecord = Record<string, unknown>;

type ConscodeTaxonsResponse = {
  data: ConscodeTaxonRecord[];
  total: number;
};

type ConscodeTaxonFilters = {
  q: string;
  conservationCode: string;
  authority: string;
  deleted: string;
};

type ConservationCodeSummary = {
  authority: string;
  value: string;
  displayOrder: string;
};

type ColumnKey =
  | 'taxonName'
  | 'conservationStatus'
  | 'authority'
  | 'conservationCode'
  | 'displayOrder'
  | 'effectiveFrom'
  | 'effectiveTo'
  | 'notes'
  | 'updated'
  | 'deleted'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'conscode_taxons.kit.datatable';
const DEFAULT_SORT_FIELD = 'conservation_code___code_priority';
const DEFAULT_SORT_ORDER: SortOrder = 'ASC';
const EXPORT_BATCH_SIZE = 500;

const defaultColumns: ColumnKey[] = [
  'taxonName',
  'conservationStatus',
  'displayOrder',
  'effectiveFrom',
  'effectiveTo',
  'actions',
];

const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'taxonName', label: 'Taxon name' },
  { key: 'conservationStatus', label: 'Conservation status' },
  { key: 'authority', label: 'Authority' },
  { key: 'conservationCode', label: 'Conservation code' },
  { key: 'displayOrder', label: 'Display order' },
  { key: 'effectiveFrom', label: 'Effective from' },
  { key: 'effectiveTo', label: 'Effective to' },
  { key: 'notes', label: 'Notes' },
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
  authority: 'conservation_code___authorising_org',
  conservationCode: 'conservation_code___conservation_code_value',
  displayOrder: 'conservation_code___code_priority',
  effectiveFrom: 'effective_from',
  effectiveTo: 'effective_to',
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

const buildFilterObject = (filters: ConscodeTaxonFilters) => {
  const nextFilter: Record<string, string | boolean> = {};

  if (filters.q) {
    nextFilter.q = filters.q;
  }
  if (filters.conservationCode) {
    nextFilter.conservation_code___conservation_code_value__contains =
      filters.conservationCode;
  }
  if (filters.authority) {
    nextFilter.conservation_code___authorising_org = filters.authority;
  }
  if (filters.deleted) {
    nextFilter.deleted = filters.deleted === 'true';
  }

  return nextFilter;
};

const fetchConscodeTaxons = async (
  page: number,
  perPage: number,
  sortField: string,
  sortOrder: SortOrder,
  filters: ConscodeTaxonFilters,
  retryOnAuthError = true
): Promise<ConscodeTaxonsResponse> => {
  const sort = encodeURIComponent(JSON.stringify([sortField, sortOrder]));
  const range = encodeURIComponent(
    JSON.stringify([(page - 1) * perPage, page * perPage - 1])
  );
  const filter = encodeURIComponent(JSON.stringify(buildFilterObject(filters)));

  const response = await fetch(
    `${BACKEND_URL}/conscode_taxons?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );

  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchConscodeTaxons(
      page,
      perPage,
      sortField,
      sortOrder,
      filters,
      false
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to load conservation code links (${response.status})`);
  }

  const rows = await response.json();
  const data = Array.isArray(rows)
    ? rows.map((row) => ({
        ...row,
        id: row.id ?? row.conscode_taxon_id,
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
  retryOnAuthError = true
) => {
  if (!ids.length) {
    return {} as Record<number, ReferenceRecord>;
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
    return fetchReferenceMap(resource, ids, idField, false);
  }

  if (!response.ok) {
    return {};
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    return {};
  }

  return rows.reduce((acc: Record<number, ReferenceRecord>, row: ReferenceRecord) => {
    const key = Number(row[idField] ?? row.id);
    if (!Number.isNaN(key)) {
      acc[key] = row;
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

const ConservationStatusBadge = ({ summary }: { summary?: ConservationCodeSummary }) => {
  if (!summary?.value) {
    return '';
  }

  return (
    <Badge variant="outline">
      {summary.authority ? `${summary.authority}: ` : ''}
      {summary.value}
    </Badge>
  );
};

const ConscodeTaxonsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = React.useMemo<ConscodeTaxonFilters>(
    () => ({
      q: searchParams.get('q') || '',
      conservationCode:
        searchParams.get('conservation_code___conservation_code_value') ||
        searchParams.get('conservation_code') ||
        '',
      authority:
        searchParams.get('conservation_code___authorising_org') ||
        searchParams.get('authority') ||
        '',
      deleted: searchParams.get('deleted') || '',
    }),
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
  const [taxonNameMap, setTaxonNameMap] = React.useState<Record<number, string>>({});
  const [conservationCodeMap, setConservationCodeMap] = React.useState<
    Record<number, ConservationCodeSummary>
  >({});
  const [isExporting, setIsExporting] = React.useState(false);
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string | null;
    data: ConscodeTaxonRecord[];
    total: number;
  }>({
    loading: true,
    error: null,
    data: [],
    total: 0,
  });

  React.useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  React.useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    fetchConscodeTaxons(page, perPage, sortField, sortOrder, filters)
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
          .map((record) => record.taxon_name_id)
          .filter((value): value is number => typeof value === 'number')
      )
    );
    const conservationCodeIds = Array.from(
      new Set(
        state.data
          .map((record) => record.conservation_code_id)
          .filter((value): value is number => typeof value === 'number')
      )
    );

    let active = true;

    Promise.all([
      fetchReferenceMap('taxon_names', taxonNameIds, 'taxon_name_id'),
      fetchReferenceMap('conservation_codes', conservationCodeIds, 'conservation_code_id'),
    ]).then(([taxonNames, conservationCodes]) => {
      if (!active) {
        return;
      }

      setTaxonNameMap(
        Object.entries(taxonNames).reduce<Record<number, string>>((acc, [key, value]) => {
          const id = Number(key);
          const formatted = String(value.formatted_scientific_name ?? '');
          if (!Number.isNaN(id) && formatted) {
            acc[id] = formatted;
          }
          return acc;
        }, {})
      );

      setConservationCodeMap(
        Object.entries(conservationCodes).reduce<Record<number, ConservationCodeSummary>>(
          (acc, [key, value]) => {
            const id = Number(key);
            if (!Number.isNaN(id)) {
              acc[id] = {
                authority: String(value.authorising_org ?? ''),
                value: String(value.conservation_code_value ?? ''),
                displayOrder: textOrEmpty(
                  value.code_priority as string | number | null | undefined
                ),
              };
            }
            return acc;
          },
          {}
        )
      );
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
        filters.conservationCode
          ? { label: 'Conservation code', value: filters.conservationCode }
          : null,
        filters.authority ? { label: 'Authority', value: filters.authority } : null,
        filters.deleted
          ? {
              label: 'Deleted',
              value: filters.deleted === 'true' ? 'Yes' : 'No',
            }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [filters]
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
      conservation_code: draftFilters.conservationCode || null,
      authority: draftFilters.authority || null,
      deleted: draftFilters.deleted || null,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setDraftFilters({
      q: '',
      conservationCode: '',
      authority: '',
      deleted: '',
    });
    setSearchParams(new URLSearchParams());
  };

  const buildExportCsv = (records: ConscodeTaxonRecord[]) => {
    const headers = [
      'Conservation code link ID',
      'Taxon name',
      'Authority',
      'Conservation code',
      'Display order',
      'Effective from',
      'Effective to',
      'Notes',
      'Deleted',
    ];

    const rows = records.map((record) => {
      const taxonNameId = record.taxon_name_id ?? 0;
      const conservationCodeId = record.conservation_code_id ?? 0;
      const conservationSummary = conservationCodeMap[conservationCodeId];

      return [
        record.conscode_taxon_id ?? record.id ?? '',
        taxonNameMap[taxonNameId] ?? '',
        conservationSummary?.authority ?? '',
        conservationSummary?.value ?? '',
        conservationSummary?.displayOrder ?? '',
        record.effective_from ?? '',
        record.effective_to ?? '',
        record.notes ?? '',
        record.deleted === undefined ? '' : record.deleted ? 'Yes' : 'No',
      ];
    });

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
      const allRecords: ConscodeTaxonRecord[] = [];

      for (let currentPage = 1; currentPage <= exportPages; currentPage += 1) {
        const result = await fetchConscodeTaxons(
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
            .map((record) => record.taxon_name_id)
            .filter((value): value is number => typeof value === 'number')
        )
      );
      const conservationCodeIds = Array.from(
        new Set(
          allRecords
            .map((record) => record.conservation_code_id)
            .filter((value): value is number => typeof value === 'number')
        )
      );

      const [taxonNames, conservationCodes] = await Promise.all([
        fetchReferenceMap('taxon_names', taxonNameIds, 'taxon_name_id'),
        fetchReferenceMap('conservation_codes', conservationCodeIds, 'conservation_code_id'),
      ]);

      const nextTaxonNameMap = Object.entries(taxonNames).reduce<Record<number, string>>(
        (acc, [key, value]) => {
          const id = Number(key);
          const formatted = String(value.formatted_scientific_name ?? '');
          if (!Number.isNaN(id) && formatted) {
            acc[id] = formatted;
          }
          return acc;
        },
        {}
      );
      const nextConservationCodeMap = Object.entries(conservationCodes).reduce<
        Record<number, ConservationCodeSummary>
      >((acc, [key, value]) => {
        const id = Number(key);
        if (!Number.isNaN(id)) {
          acc[id] = {
            authority: String(value.authorising_org ?? ''),
            value: String(value.conservation_code_value ?? ''),
            displayOrder: textOrEmpty(
              value.code_priority as string | number | null | undefined
            ),
          };
        }
        return acc;
      }, {});

      const previousTaxonNameMap = taxonNameMap;
      const previousConservationCodeMap = conservationCodeMap;
      setTaxonNameMap(nextTaxonNameMap);
      setConservationCodeMap(nextConservationCodeMap);
      const csv = buildExportCsv(allRecords);
      setTaxonNameMap(previousTaxonNameMap);
      setConservationCodeMap(previousConservationCodeMap);

      const dateStamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`conscode_taxons_${dateStamp}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCellContent = (column: ColumnKey, record: ConscodeTaxonRecord) => {
    const linkId = record.conscode_taxon_id ?? record.id ?? 0;
    const taxonNameId = record.taxon_name_id ?? 0;
    const conservationCodeId = record.conservation_code_id ?? 0;
    const conservationSummary = conservationCodeMap[conservationCodeId];

    switch (column) {
      case 'taxonName':
        return renderHtmlOrFallback(taxonNameMap[taxonNameId]);
      case 'conservationStatus':
        return <ConservationStatusBadge summary={conservationSummary} />;
      case 'authority':
        return textOrEmpty(conservationSummary?.authority);
      case 'conservationCode':
        return textOrEmpty(conservationSummary?.value);
      case 'displayOrder':
        return (
          <span className="text-muted-foreground">
            {textOrEmpty(conservationSummary?.displayOrder)}
          </span>
        );
      case 'effectiveFrom':
        return (
          <span className="text-muted-foreground">
            {formatDate(record.effective_from)}
          </span>
        );
      case 'effectiveTo':
        return (
          <span className="text-muted-foreground">
            {formatDate(record.effective_to)}
          </span>
        );
      case 'notes':
        return textOrEmpty(record.notes);
      case 'updated':
        return (
          <span className="text-muted-foreground">{formatDate(record.updated_on)}</span>
        );
      case 'deleted':
        return booleanOrEmpty(record.deleted);
      case 'actions':
        return (
          <RecordActionButtons
            resource="conscode_taxons"
            showTo={`/conscode_taxons/${linkId}/show`}
            editTo={`/conscode_taxons/${linkId}`}
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
            <h1 className="text-2xl font-semibold tracking-tight">
              Conservation code links
            </h1>
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
          <AuthorizedButtonLink resource="conscode_taxons" action="create" to="/conscode_taxons/create" variant="outline">
            <Plus className="h-4 w-4" />
            Create
          </AuthorizedButtonLink>
          <ColumnsButton resource="conscode_taxons" storeKey={TABLE_STORE_KEY} />
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
                    setDraftFilters((current) => ({
                      ...current,
                      q: event.target.value,
                    }))
                  }
                  placeholder="Search conservation links"
                  className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Conservation code</label>
              <input
                value={draftFilters.conservationCode}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    conservationCode: event.target.value,
                  }))
                }
                placeholder="Code value"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Authority</label>
              <select
                value={draftFilters.authority}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    authority: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any authority</option>
                {ConservationType.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deleted</label>
              <select
                value={draftFilters.deleted}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    deleted: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                {booleanOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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

          <DataTable<ConscodeTaxonRecord>
            resource="conscode_taxons"
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
              <DataTable.Col<ConscodeTaxonRecord>
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
                  htmlFor="conscode-taxons-per-page"
                  className="text-sm text-muted-foreground"
                >
                  Rows
                </label>
                <select
                  id="conscode-taxons-per-page"
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

export default ConscodeTaxonsPage;
