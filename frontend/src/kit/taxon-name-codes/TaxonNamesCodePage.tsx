import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnsButton } from '@/components/admin/columns-button';
import { DataTable } from '@/components/admin/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import authProvider from '../../admin/authProvider';
import AuthorizedButtonLink from '../shared/AuthorizedButtonLink';
import RecordActionButtons from '../shared/RecordActionButtons';
import ConservationType from '../shared/choices/ConservationType';
import PublicationStatus from '../shared/choices/PublicationStatus';
import TaxonRank from '../shared/choices/TaxonRank';
import { BACKEND_URL } from '../../config';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

type SortOrder = 'ASC' | 'DESC';

type TaxonNameRecord = {
  id?: number;
  taxon_name_id?: number;
  legacy_id?: string | number;
  scientific_name?: string;
  canonical_name?: string;
  formatted_scientific_name?: string;
  author?: string;
  kingdom?: { kingdom_name?: string } | string;
  taxon_rank?: { rank_name?: string } | string;
  form_desc_yr?: string | number;
  publication_id?: number;
  publication_status?: string;
  is_current?: boolean;
  validated?: boolean;
  all_vernaculars?: string;
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type TaxonNamesResponse = {
  data: TaxonNameRecord[];
  total: number;
};

type TaxonNameCodeFilters = {
  q: string;
  id: string;
  legacyId: string;
  scientificName: string;
  author: string;
  yearPublished: string;
  publicationName: string;
  vernacular: string;
  taxonRank: string;
  conservationCode: string;
  authority: string;
  conservationCodeActive: string;
  publicationStatus: string;
  isCurrent: string;
  validated: string;
  deleted: string;
};

type ColumnKey =
  | 'legacyId'
  | 'rank'
  | 'name'
  | 'author'
  | 'yearPublished'
  | 'kingdom'
  | 'canonicalName'
  | 'publication'
  | 'status'
  | 'isCurrent'
  | 'validated'
  | 'vernaculars'
  | 'conservationCodes'
  | 'updatedBy'
  | 'updated'
  | 'deleted'
  | 'actions';

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'taxon_names_code.kit.datatable';
const DEFAULT_SORT_FIELD = 'updated_on';
const DEFAULT_SORT_ORDER: SortOrder = 'DESC';
const EXPORT_BATCH_SIZE = 500;

const defaultColumns: ColumnKey[] = [
  'rank',
  'name',
  'isCurrent',
  'conservationCodes',
  'actions',
];

const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'legacyId', label: 'Legacy ID' },
  { key: 'rank', label: 'Taxon rank' },
  { key: 'name', label: 'Taxon name' },
  { key: 'author', label: 'Author' },
  { key: 'yearPublished', label: 'Year published' },
  { key: 'kingdom', label: 'Kingdom' },
  { key: 'canonicalName', label: 'Canonical name' },
  { key: 'publication', label: 'Publication' },
  { key: 'status', label: 'Publication status' },
  { key: 'isCurrent', label: 'Is current?' },
  { key: 'validated', label: 'Validated' },
  { key: 'vernaculars', label: 'Vernaculars' },
  { key: 'conservationCodes', label: 'Conservation codes' },
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
  legacyId: 'legacy_id',
  rank: 'taxon_rank___rank_name',
  name: 'scientific_name',
  author: 'author',
  yearPublished: 'form_desc_yr',
  kingdom: 'kingdom___kingdom_name',
  canonicalName: 'canonical_name',
  publication: 'publication___title',
  status: 'publication_status',
  isCurrent: 'is_current',
  validated: 'validated',
  vernaculars: 'all_vernaculars',
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

const buildFilterObject = (filters: TaxonNameCodeFilters) => {
  const nextFilter: Record<string, string | boolean> = {};

  if (filters.q) nextFilter.q = filters.q;
  if (filters.id) nextFilter.id = filters.id;
  if (filters.legacyId) nextFilter.legacy_id__contains = filters.legacyId;
  if (filters.scientificName) {
    nextFilter.scientific_name__contains = filters.scientificName;
  }
  if (filters.author) nextFilter.author__contains = filters.author;
  if (filters.yearPublished) nextFilter.form_desc_yr = filters.yearPublished;
  if (filters.publicationName) {
    nextFilter.publication___title__contains = filters.publicationName;
  }
  if (filters.vernacular) {
    nextFilter.all_vernaculars__contains = filters.vernacular;
  }
  if (filters.taxonRank) {
    nextFilter.taxon_rank___rank_name = filters.taxonRank;
  }
  if (filters.conservationCode) {
    nextFilter.conscode_taxons___conservation_code___conservation_code_value =
      filters.conservationCode;
  }
  if (filters.authority) {
    nextFilter.conscode_taxons___conservation_code___authorising_org =
      filters.authority;
  }
  nextFilter.conscode_taxons___isactive = filters.conservationCodeActive !== 'false';
  if (filters.publicationStatus) {
    nextFilter.publication_status = filters.publicationStatus;
  }
  if (filters.isCurrent) nextFilter.is_current = filters.isCurrent === 'true';
  if (filters.validated) nextFilter.validated = filters.validated === 'true';
  if (filters.deleted) nextFilter.deleted = filters.deleted === 'true';

  return nextFilter;
};

const fetchTaxonNames = async (
  page: number,
  perPage: number,
  sortField: string,
  sortOrder: SortOrder,
  filters: TaxonNameCodeFilters,
  retryOnAuthError = true
): Promise<TaxonNamesResponse> => {
  const sort = encodeURIComponent(JSON.stringify([sortField, sortOrder]));
  const range = encodeURIComponent(
    JSON.stringify([(page - 1) * perPage, page * perPage - 1])
  );
  const filter = encodeURIComponent(JSON.stringify(buildFilterObject(filters)));

  const response = await fetch(
    `${BACKEND_URL}/taxon_names?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );

  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchTaxonNames(page, perPage, sortField, sortOrder, filters, false);
  }

  if (!response.ok) {
    throw new Error(`Failed to load taxon names (${response.status})`);
  }

  const rows = await response.json();
  const data = Array.isArray(rows)
    ? rows.map((row) => ({
        ...row,
        id: row.id ?? row.taxon_name_id,
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

const fetchConservationCodeMap = async (
  taxonNameIds: number[],
  activeOnly: boolean,
  retryOnAuthError = true
) => {
  if (!taxonNameIds.length) {
    return {} as Record<number, string[]>;
  }

  const sort = encodeURIComponent(
    JSON.stringify(['conservation_code___code_priority', 'ASC'])
  );
  const range = encodeURIComponent(
    JSON.stringify([0, Math.max(taxonNameIds.length * 5, 50)])
  );
  const filter = encodeURIComponent(
    JSON.stringify(
      activeOnly
        ? { taxon_name_id: taxonNameIds, isactive: true }
        : { taxon_name_id: taxonNameIds }
    )
  );
  const response = await fetch(
    `${BACKEND_URL}/conscode_taxons?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );

  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchConservationCodeMap(taxonNameIds, activeOnly, false);
  }

  if (!response.ok) {
    return {};
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    return {};
  }

  const codeIds = Array.from(
    new Set(
      rows
        .map((row) => Number((row as Record<string, unknown>).conservation_code_id))
        .filter((value) => !Number.isNaN(value))
    )
  );
  const codeMap = await fetchReferenceMap(
    'conservation_codes',
    codeIds,
    'conservation_code_id',
    'conservation_code_value'
  );

  return rows.reduce((acc: Record<number, string[]>, row: Record<string, unknown>) => {
    const taxonId = Number(row.taxon_name_id);
    const codeId = Number(row.conservation_code_id);
    const codeValue =
      typeof row.conservation_code___conservation_code_value === 'string'
        ? row.conservation_code___conservation_code_value
        : codeMap[codeId];
    const authority =
      typeof row.conservation_code___authorising_org === 'string'
        ? row.conservation_code___authorising_org
        : '';
    if (Number.isNaN(taxonId) || !codeValue) {
      return acc;
    }

    const label = authority ? `${authority}: ${codeValue}` : codeValue;
    const current = acc[taxonId] || [];
    acc[taxonId] = current.includes(label) ? current : [...current, label];
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

const publicationStatusOptions = [
  { label: 'Any status', value: '' },
  ...PublicationStatus.map((option) => ({
    label: option.name,
    value: option.id,
  })),
];

const booleanOptions = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

const activeConservationOptions = [
  { label: 'Active only', value: 'true' },
  { label: 'All codes', value: 'false' },
];

const TaxonNamesCodePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [canUseDeletedFilter, setCanUseDeletedFilter] = React.useState(false);
  const filters = React.useMemo<TaxonNameCodeFilters>(
    () => ({
      q: searchParams.get('q') || '',
      id: searchParams.get('id') || '',
      legacyId: searchParams.get('legacy_id') || '',
      scientificName: searchParams.get('scientific_name') || '',
      author: searchParams.get('author') || '',
      yearPublished: searchParams.get('form_desc_yr') || '',
      publicationName: searchParams.get('publication_name') || '',
      vernacular: searchParams.get('vernacular') || '',
      taxonRank: searchParams.get('taxon_rank') || '',
      conservationCode: searchParams.get('conservation_code') || '',
      authority: searchParams.get('authority') || '',
      conservationCodeActive: searchParams.get('conservation_code_active') || 'true',
      publicationStatus: searchParams.get('publication_status') || '',
      isCurrent: searchParams.get('is_current') || '',
      validated: searchParams.get('validated') || '',
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
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [publicationMap, setPublicationMap] = React.useState<Record<number, string>>({});
  const [userMap, setUserMap] = React.useState<Record<number, string>>({});
  const [conservationCodeMap, setConservationCodeMap] = React.useState<
    Record<number, string[]>
  >({});
  const [isExporting, setIsExporting] = React.useState(false);
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string | null;
    data: TaxonNameRecord[];
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
      .canAccess({ resource: 'taxon_names', action: 'deletedfilter' })
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

    fetchTaxonNames(page, perPage, sortField, sortOrder, filters)
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
    const publicationIds = Array.from(
      new Set(
        state.data
          .map((record) => record.publication_id)
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
    const taxonNameIds = Array.from(
      new Set(
        state.data
          .map((record) => record.id)
          .filter((value): value is number => typeof value === 'number')
      )
    );

    let active = true;

    Promise.all([
      fetchReferenceMap('publications', publicationIds, 'publication_id', 'title'),
      fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
      fetchConservationCodeMap(
        taxonNameIds,
        filters.conservationCodeActive !== 'false'
      ),
    ]).then(([publications, users, conservationCodes]) => {
      if (!active) {
        return;
      }
      setPublicationMap(publications);
      setUserMap(users);
      setConservationCodeMap(conservationCodes);
    });

    return () => {
      active = false;
    };
  }, [state.data, filters.conservationCodeActive]);

  const totalPages = Math.max(Math.ceil(state.total / perPage), 1);

  const activeFilterBadges = React.useMemo(
    () =>
      [
        filters.q ? { label: 'Query', value: filters.q } : null,
        filters.id ? { label: 'Taxon name ID', value: filters.id } : null,
        filters.legacyId ? { label: 'Legacy ID', value: filters.legacyId } : null,
        filters.scientificName
          ? { label: 'Scientific name', value: filters.scientificName }
          : null,
        filters.author ? { label: 'Author', value: filters.author } : null,
        filters.yearPublished
          ? { label: 'Year published', value: filters.yearPublished }
          : null,
        filters.publicationName
          ? { label: 'Publication', value: filters.publicationName }
          : null,
        filters.vernacular ? { label: 'Vernacular', value: filters.vernacular } : null,
        filters.taxonRank ? { label: 'Taxon rank', value: filters.taxonRank } : null,
        filters.conservationCode
          ? { label: 'Conservation code', value: filters.conservationCode }
          : null,
        filters.authority ? { label: 'Authority', value: filters.authority } : null,
        filters.conservationCodeActive === 'false'
          ? { label: 'Code scope', value: 'All codes' }
          : null,
        filters.publicationStatus
          ? { label: 'Status', value: filters.publicationStatus }
          : null,
        filters.isCurrent
          ? { label: 'Is current', value: filters.isCurrent === 'true' ? 'Yes' : 'No' }
          : null,
        filters.validated
          ? { label: 'Validated', value: filters.validated === 'true' ? 'Yes' : 'No' }
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
      id: draftFilters.id || null,
      legacy_id: draftFilters.legacyId || null,
      scientific_name: draftFilters.scientificName || null,
      author: draftFilters.author || null,
      form_desc_yr: draftFilters.yearPublished || null,
      publication_name: draftFilters.publicationName || null,
      vernacular: draftFilters.vernacular || null,
      taxon_rank: draftFilters.taxonRank || null,
      conservation_code: draftFilters.conservationCode || null,
      authority: draftFilters.authority || null,
      conservation_code_active:
        draftFilters.conservationCodeActive === 'true'
          ? null
          : draftFilters.conservationCodeActive,
      publication_status: draftFilters.publicationStatus || null,
      is_current: draftFilters.isCurrent || null,
      validated: draftFilters.validated || null,
      deleted: canUseDeletedFilter ? draftFilters.deleted || null : null,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    const nextFilters: TaxonNameCodeFilters = {
      q: '',
      id: '',
      legacyId: '',
      scientificName: '',
      author: '',
      yearPublished: '',
      publicationName: '',
      vernacular: '',
      taxonRank: '',
      conservationCode: '',
      authority: '',
      conservationCodeActive: 'true',
      publicationStatus: '',
      isCurrent: '',
      validated: '',
      deleted: '',
    };
    setDraftFilters(nextFilters);
    const nextParams = new URLSearchParams();
    setSearchParams(nextParams);
  };

  const buildExportCsv = (records: TaxonNameRecord[]) => {
    const headers = [
      'Taxon name ID',
      'Legacy ID',
      'Taxon rank',
      'Taxon name',
      'Author',
      'Kingdom',
      'Year published',
      'Publication',
      'Publication status',
      'Is current',
      'Validated',
      'Vernaculars',
      'Conservation codes',
      'Updated',
    ];

    const rows = records.map((record) => {
      const taxonNameId = record.taxon_name_id ?? record.id ?? 0;
      return [
        taxonNameId,
        record.legacy_id ?? '',
        typeof record.taxon_rank === 'string'
          ? record.taxon_rank
          : record.taxon_rank?.rank_name ?? '',
        record.scientific_name ?? '',
        record.author ?? '',
        typeof record.kingdom === 'string'
          ? record.kingdom
          : record.kingdom?.kingdom_name ?? '',
        record.form_desc_yr ?? '',
        record.publication_id ? publicationMap[record.publication_id] ?? '' : '',
        record.publication_status ?? '',
        record.is_current === undefined ? '' : record.is_current ? 'Yes' : 'No',
        record.validated === undefined ? '' : record.validated ? 'Yes' : 'No',
        record.all_vernaculars ?? '',
        (conservationCodeMap[taxonNameId] || []).join(' | '),
        record.updated_on ?? '',
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
      const allRecords: TaxonNameRecord[] = [];

      for (let currentPage = 1; currentPage <= exportPages; currentPage += 1) {
        const result = await fetchTaxonNames(
          currentPage,
          EXPORT_BATCH_SIZE,
          sortField,
          sortOrder,
          filters
        );
        allRecords.push(...result.data);
      }

      const publicationIds = Array.from(
        new Set(
          allRecords
            .map((record) => record.publication_id)
            .filter((value): value is number => typeof value === 'number')
        )
      );
      const taxonNameIds = Array.from(
        new Set(
          allRecords
            .map((record) => record.id)
            .filter((value): value is number => typeof value === 'number')
        )
      );

      const [nextPublicationMap, nextConservationCodeMap] = await Promise.all([
        fetchReferenceMap('publications', publicationIds, 'publication_id', 'title'),
        fetchConservationCodeMap(
          taxonNameIds,
          filters.conservationCodeActive !== 'false'
        ),
      ]);

      const previousPublicationMap = publicationMap;
      const previousConservationCodeMap = conservationCodeMap;
      setPublicationMap(nextPublicationMap);
      setConservationCodeMap(nextConservationCodeMap);
      const csv = buildExportCsv(allRecords);
      setPublicationMap(previousPublicationMap);
      setConservationCodeMap(previousConservationCodeMap);

      const dateStamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`taxon_names_code_${dateStamp}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCellContent = (column: ColumnKey, record: TaxonNameRecord) => {
    const taxonNameId = record.taxon_name_id ?? record.id ?? 0;

    switch (column) {
      case 'legacyId':
        return textOrEmpty(record.legacy_id);
      case 'rank':
        return typeof record.taxon_rank === 'string'
          ? record.taxon_rank
          : record.taxon_rank?.rank_name ?? '';
      case 'name':
        return renderHtmlOrFallback(record.formatted_scientific_name, record.scientific_name || '');
      case 'author':
        return textOrEmpty(record.author);
      case 'yearPublished':
        return (
          <span className="text-muted-foreground">
            {textOrEmpty(record.form_desc_yr as string | number | null)}
          </span>
        );
      case 'kingdom':
        return typeof record.kingdom === 'string'
          ? record.kingdom
          : record.kingdom?.kingdom_name ?? '';
      case 'canonicalName':
        return renderHtmlOrFallback(record.canonical_name);
      case 'publication':
        return (record.publication_id && publicationMap[record.publication_id]) || '';
      case 'status':
        return textOrEmpty(record.publication_status);
      case 'isCurrent':
        return booleanOrEmpty(record.is_current);
      case 'validated':
        return booleanOrEmpty(record.validated);
      case 'vernaculars':
        return textOrEmpty(record.all_vernaculars);
      case 'conservationCodes':
        return conservationCodeMap[taxonNameId]?.length ? (
          <div className="flex flex-wrap gap-2">
            {conservationCodeMap[taxonNameId].map((code) => (
              <Badge key={code} variant="outline">
                {code}
              </Badge>
            ))}
          </div>
        ) : (
          ''
        );
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
            resource="taxon_names"
            showTo={`/taxon_names/${taxonNameId}/show`}
            editTo={`/taxon_names/${taxonNameId}`}
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
              Taxon names with conservation codes
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
          <ColumnsButton resource="taxon_names_code" storeKey={TABLE_STORE_KEY} />
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
                  placeholder="Name, ID, publication..."
                  className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Taxon name ID</label>
                <input
                  value={draftFilters.id}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, id: event.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Legacy ID</label>
                <input
                  value={draftFilters.legacyId}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      legacyId: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scientific name</label>
              <input
                value={draftFilters.scientificName}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    scientificName: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
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
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code scope</label>
                <select
                  value={draftFilters.conservationCodeActive}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      conservationCodeActive: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {activeConservationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
          </div>

          <div className="rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((current) => !current)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-medium">More filters</p>
                <p className="text-xs text-muted-foreground">
                  Show the extended legacy filter set
                </p>
              </div>
              {activeFilterBadges.length > 6 ? (
                <Badge variant="outline">{activeFilterBadges.length - 6} more active</Badge>
              ) : null}
            </button>

            {showAdvancedFilters ? (
              <div className="space-y-4 border-t border-border px-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author</label>
                  <input
                    value={draftFilters.author}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        author: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year published</label>
                  <input
                    value={draftFilters.yearPublished}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        yearPublished: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Publication</label>
                  <input
                    value={draftFilters.publicationName}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        publicationName: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vernacular</label>
                  <input
                    value={draftFilters.vernacular}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        vernacular: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Publication status</label>
                    <select
                      value={draftFilters.publicationStatus}
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          publicationStatus: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {publicationStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Is current?</label>
                    <select
                      value={draftFilters.isCurrent}
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          isCurrent: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {booleanOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Validated?</label>
                    <select
                      value={draftFilters.validated}
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          validated: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {booleanOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
              </div>
            ) : null}
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

          <DataTable<TaxonNameRecord>
            resource="taxon_names_code"
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
              <DataTable.Col<TaxonNameRecord>
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
                  htmlFor="taxon-names-code-per-page"
                  className="text-sm text-muted-foreground"
                >
                  Rows
                </label>
                <select
                  id="taxon-names-code-per-page"
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

export default TaxonNamesCodePage;
