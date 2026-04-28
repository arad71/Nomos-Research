import * as React from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDataProvider } from 'ra-core';
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
  author_ids?: number[];
  publication_year?: string | number;
  publication_month?: string | number;
  publication_day?: string | number;
  published?: boolean;
  abbreviated_title?: string;
  title?: string;
  doi?: string;
  publisher?: string;
  parent_id?: number;
  published_location?: string;
  volume?: string;
  edition?: string;
  pages?: string;
  legacy_id?: string | number;
  isbn?: string;
  issn?: string;
  tl2?: string;
  bhl_url?: string;
  reference_type?: string;
  reference_author_role?: string;
  duplicate_of_id?: number;
  language?: string;
  notes?: string;
  bad_publication?: boolean;
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type TaxonPublicationRecord = {
  id?: number;
  taxon_publication_id?: number;
  publication_id?: number | string;
  taxon_name_id?: number | string;
  taxon_name___scientific_name?: string;
  taxon_name___formatted_scientific_name?: string;
  taxon_name?: {
    scientific_name?: string | null;
    formatted_scientific_name?: string | null;
  } | null;
};

type PublicationsResponse = {
  data: PublicationRecord[];
  total: number;
};

type PublicationFilters = {
  q: string;
  taxonQ: string;
  title: string;
  authorName: string;
  doi: string;
  publicationYear: string;
  publisher: string;
  published: string;
  deleted: string;
};

type PublicationQuery = Omit<PublicationFilters, 'taxonQ'> & {
  publicationIds?: number[];
};

type ColumnKey =
  | 'displayTitle'
  | 'authorName'
  | 'linkedTaxonNames'
  | 'taxonPublicationLinks'
  | 'authors'
  | 'publicationYear'
  | 'publicationMonth'
  | 'publicationDay'
  | 'published'
  | 'abbreviatedTitle'
  | 'title'
  | 'doi'
  | 'publisher'
  | 'parentPublication'
  | 'publishedLocation'
  | 'volume'
  | 'edition'
  | 'pages'
  | 'legacyId'
  | 'isbn'
  | 'issn'
  | 'tl2'
  | 'bhlUrl'
  | 'referenceType'
  | 'referenceAuthorRole'
  | 'duplicateOf'
  | 'language'
  | 'notes'
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
  'linkedTaxonNames',
  'taxonPublicationLinks',
  'publicationYear',
  'published',
  'abbreviatedTitle',
  'actions',
];
const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'displayTitle', label: 'Display title' },
  { key: 'authorName', label: 'Publication authors' },
  { key: 'linkedTaxonNames', label: 'Linked taxon names' },
  { key: 'taxonPublicationLinks', label: 'Taxon links' },
  { key: 'authors', label: 'Authors' },
  { key: 'publicationYear', label: 'Year' },
  { key: 'publicationMonth', label: 'Month' },
  { key: 'publicationDay', label: 'Day' },
  { key: 'published', label: 'Published' },
  { key: 'abbreviatedTitle', label: 'Abbreviated title' },
  { key: 'title', label: 'Title' },
  { key: 'doi', label: 'DOI' },
  { key: 'publisher', label: 'Publisher' },
  { key: 'parentPublication', label: 'Parent publication' },
  { key: 'publishedLocation', label: 'Published location' },
  { key: 'volume', label: 'Volume' },
  { key: 'edition', label: 'Edition' },
  { key: 'pages', label: 'Pages' },
  { key: 'legacyId', label: 'Legacy ID' },
  { key: 'isbn', label: 'ISBN' },
  { key: 'issn', label: 'ISSN' },
  { key: 'tl2', label: 'TL2' },
  { key: 'bhlUrl', label: 'BHL URL' },
  { key: 'referenceType', label: 'Reference type' },
  { key: 'referenceAuthorRole', label: 'Reference author role' },
  { key: 'duplicateOf', label: 'Duplicate of' },
  { key: 'language', label: 'Language' },
  { key: 'notes', label: 'Notes' },
  { key: 'badPublication', label: 'Bad publication' },
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
  displayTitle: 'display_title',
  authorName: 'author_name',
  publicationYear: 'publication_year',
  publicationMonth: 'publication_month',
  publicationDay: 'publication_day',
  published: 'published',
  abbreviatedTitle: 'abbreviated_title',
  title: 'title',
  doi: 'doi',
  publisher: 'publisher',
  parentPublication: 'parent_id',
  publishedLocation: 'published_location',
  volume: 'volume',
  edition: 'edition',
  pages: 'pages',
  legacyId: 'legacy_id',
  isbn: 'isbn',
  issn: 'issn',
  tl2: 'tl2',
  bhlUrl: 'bhl_url',
  referenceType: 'reference_type',
  referenceAuthorRole: 'reference_author_role',
  duplicateOf: 'duplicate_of_id',
  language: 'language',
  notes: 'notes',
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

const toNumberId = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const uniqueNumericIds = (values: unknown[]) =>
  Array.from(
    new Set(values.map(toNumberId).filter((value): value is number => value !== undefined))
  );

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
  filters: PublicationQuery,
  retryOnAuthError = true
): Promise<PublicationsResponse> => {
  const sort = encodeURIComponent(JSON.stringify([sortField, sortOrder]));
  const range = encodeURIComponent(JSON.stringify([(page - 1) * perPage, page * perPage - 1]));
  const buildFilterPayload = () => {
    const payload: Record<string, unknown> = {};
    if (filters.q) payload.q = filters.q;
    if (filters.title) payload.title__contains = filters.title;
    if (filters.authorName) payload.author_name__contains = filters.authorName;
    if (filters.doi) payload.doi__contains = filters.doi;
    if (filters.publicationYear) payload.publication_year = filters.publicationYear;
    if (filters.publisher) payload.publisher__contains = filters.publisher;
    if (filters.published) payload.published = filters.published === 'true';
    if (filters.deleted) payload.deleted = filters.deleted === 'true';
    return payload;
  };
  const requestWithFilter = async (filterPayload: Record<string, unknown>) => {
    const filter = encodeURIComponent(JSON.stringify(filterPayload));
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

  const filterPayload = buildFilterPayload();
  if (!filters.publicationIds?.length) {
    return requestWithFilter(filterPayload);
  }

  const byPublicationId = await requestWithFilter({
    ...filterPayload,
    publication_id: filters.publicationIds,
  });
  if (byPublicationId.total > 0) return byPublicationId;

  return requestWithFilter({
    ...filterPayload,
    id: filters.publicationIds,
  });
};

const fetchTaxonPublicationRowsByFilter = async (
  filterObject: Record<string, unknown>,
  retryOnAuthError = true
): Promise<TaxonPublicationRecord[]> => {
  const sort = encodeURIComponent(JSON.stringify(['taxon_publication_id', 'ASC']));
  const range = encodeURIComponent(JSON.stringify([0, 10000]));
  const filter = encodeURIComponent(JSON.stringify(filterObject));
  const endpoints = ['taxon-publications', 'taxon_publications'];
  let response: Response | null = null;
  for (const endpoint of endpoints) {
    const candidate = await fetch(
      `${BACKEND_URL}/${endpoint}?sort=${sort}&range=${range}&filter=${filter}`,
      { headers: buildHeaders() }
    );
    if (candidate.ok || candidate.status !== 404) {
      response = candidate;
      break;
    }
  }
  if (!response) return [];
  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchTaxonPublicationRowsByFilter(filterObject, false);
  }
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
};

const dedupeTaxonPublicationRows = (rows: TaxonPublicationRecord[]) => {
  const seen = new Set<string>();
  const deduped: TaxonPublicationRecord[] = [];
  rows.forEach((row, index) => {
    const key =
      String(row.taxon_publication_id ?? row.id ?? '') ||
      `${row.publication_id ?? ''}-${row.taxon_name_id ?? ''}-${index}`;
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(row);
  });
  return deduped;
};

const fetchTaxonPublicationsViaDataProvider = async (
  dataProvider: ReturnType<typeof useDataProvider>,
  publicationIds: number[]
) => {
  if (!publicationIds.length) return [];
  const resources = ['taxon-publications', 'taxon_publications'] as const;

  const fetchForResource = async (resource: (typeof resources)[number]) => {
    const batches = await Promise.all(
      publicationIds.map(async (publicationId) => {
        const perPage = 250;
        let page = 1;
        const rows: TaxonPublicationRecord[] = [];
        while (true) {
          const response = await dataProvider.getManyReference(resource, {
            target: 'publication_id',
            id: publicationId,
            pagination: { page, perPage },
            sort: { field: 'taxon_publication_id', order: 'ASC' },
            filter: {},
          });
          const data = Array.isArray(response?.data)
            ? (response.data as TaxonPublicationRecord[])
            : [];
          rows.push(...data);
          const total = typeof response?.total === 'number' ? response.total : undefined;
          if (!data.length) break;
          if ((total !== undefined && rows.length >= total) || data.length < perPage) break;
          page += 1;
        }
        return rows;
      })
    );
    return dedupeTaxonPublicationRows(batches.flat());
  };

  try {
    const rows = await fetchForResource('taxon-publications');
    if (rows.length > 0) return rows;
  } catch {
    // Try underscore resource fallback below.
  }
  try {
    return await fetchForResource('taxon_publications');
  } catch {
    return [];
  }
};

const fetchTaxonPublicationRowsByLinkedTaxonQueryViaDataProvider = async (
  dataProvider: ReturnType<typeof useDataProvider>,
  taxonQuery: string
) => {
  const trimmed = taxonQuery.trim();
  if (!trimmed) return [] as TaxonPublicationRecord[];
  const resources = ['taxon-publications', 'taxon_publications'] as const;
  const linkedFilters = [
    { taxon_name___scientific_name__contains: trimmed },
    { taxon_name___scientific_name__ilike: `%${trimmed}%` },
    { taxon_name___canonical_name__contains: trimmed },
    { taxon_name___canonical_name__ilike: `%${trimmed}%` },
  ];

  const fetchAllForResourceFilter = async (
    resource: (typeof resources)[number],
    filter: Record<string, unknown>
  ) => {
    const perPage = 250;
    let page = 1;
    const rows: TaxonPublicationRecord[] = [];
    while (true) {
      const response = await dataProvider.getList(resource, {
        pagination: { page, perPage },
        sort: { field: 'taxon_publication_id', order: 'ASC' },
        filter,
      });
      const data = Array.isArray(response?.data)
        ? (response.data as TaxonPublicationRecord[])
        : [];
      rows.push(...data);
      const total = typeof response?.total === 'number' ? response.total : undefined;
      if (!data.length) break;
      if ((total !== undefined && rows.length >= total) || data.length < perPage) break;
      page += 1;
    }
    return rows;
  };

  for (const resource of resources) {
    for (const filter of linkedFilters) {
      try {
        const rows = await fetchAllForResourceFilter(resource, filter);
        if (rows.length > 0) return dedupeTaxonPublicationRows(rows);
      } catch {
        // Try next combination.
      }
    }
  }

  const taxonNameFilters = [
    { scientific_name__contains: trimmed },
    { scientific_name__ilike: `%${trimmed}%` },
    { canonical_name__contains: trimmed },
    { canonical_name__ilike: `%${trimmed}%` },
    { q: trimmed },
  ];
  let taxonNameIds: number[] = [];
  for (const filter of taxonNameFilters) {
    try {
      const response = await dataProvider.getList('taxon_names', {
        pagination: { page: 1, perPage: 5000 },
        sort: { field: 'scientific_name', order: 'ASC' },
        filter,
      });
      const ids = uniqueNumericIds(
        (Array.isArray(response?.data) ? response.data : []).map(
          (row) => (row as Record<string, unknown>).taxon_name_id ?? (row as Record<string, unknown>).id
        )
      );
      if (ids.length > 0) {
        taxonNameIds = ids;
        break;
      }
    } catch {
      // Try next filter.
    }
  }
  if (!taxonNameIds.length) return [];

  for (const resource of resources) {
    try {
      const batches = await Promise.all(
        taxonNameIds.map((taxonNameId) =>
          dataProvider.getList(resource, {
            pagination: { page: 1, perPage: 250 },
            sort: { field: 'taxon_publication_id', order: 'ASC' },
            filter: { taxon_name_id: taxonNameId },
          })
        )
      );
      const rows = dedupeTaxonPublicationRows(
        batches.flatMap((response) =>
          Array.isArray(response?.data) ? (response.data as TaxonPublicationRecord[]) : []
        )
      );
      if (rows.length > 0) return rows;
    } catch {
      // Try next resource.
    }
  }

  return [];
};

const fetchTaxonPublications = async (
  publicationIds: number[],
  retryOnAuthError = true
): Promise<TaxonPublicationRecord[]> => {
  if (!publicationIds.length) return [];
  if (publicationIds.length === 1) {
    const rows = await fetchTaxonPublicationRowsByFilter(
      { publication_id: publicationIds[0] },
      retryOnAuthError
    );
    if (rows.length > 0) return rows;
    return fetchTaxonPublicationRowsByFilter({ publication_id: [publicationIds[0]] }, retryOnAuthError);
  }

  const rowBatches = await Promise.all(
    publicationIds.map((publicationId) =>
      fetchTaxonPublicationRowsByFilter({ publication_id: publicationId }, retryOnAuthError)
    )
  );
  const flattened = rowBatches.flat();
  if (flattened.length > 0) {
    return dedupeTaxonPublicationRows(flattened);
  }

  const fallbackBatches = await Promise.all(
    publicationIds.map((publicationId) =>
      fetchTaxonPublicationRowsByFilter({ publication_id: [publicationId] }, retryOnAuthError)
    )
  );
  return dedupeTaxonPublicationRows(fallbackBatches.flat());
};

const fetchPublicationIdsByTaxonQuery = async (
  dataProvider: ReturnType<typeof useDataProvider>,
  taxonQuery: string,
  retryOnAuthError = true
): Promise<number[]> => {
  const trimmedQuery = taxonQuery.trim();
  if (!trimmedQuery) return [];

  let linkRows = await fetchTaxonPublicationRowsByLinkedTaxonQueryViaDataProvider(
    dataProvider,
    trimmedQuery
  );
  if (!linkRows.length && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    linkRows = await fetchTaxonPublicationRowsByLinkedTaxonQueryViaDataProvider(
      dataProvider,
      trimmedQuery
    );
  }
  if (!linkRows.length) return [];

  return Array.from(
    new Set(
      linkRows
        .map((row: Record<string, unknown>) => Number(row.publication_id))
        .filter((value) => !Number.isNaN(value))
    )
  );
};

const mapTaxonPublicationsByPublication = (rows: TaxonPublicationRecord[]) =>
  rows.reduce<Record<number, TaxonPublicationRecord[]>>((acc, row) => {
    const publicationId = Number(row.publication_id);
    if (Number.isNaN(publicationId)) return acc;
    if (!acc[publicationId]) acc[publicationId] = [];
    acc[publicationId].push(row);
    return acc;
  }, {});

const getTaxonLabelFromLink = (
  link: TaxonPublicationRecord,
  taxonNameMap: Record<number, string>
) => {
  if (typeof link.taxon_name_id === 'number' && taxonNameMap[link.taxon_name_id]) {
    return taxonNameMap[link.taxon_name_id];
  }
  return (
    link.taxon_name___scientific_name ||
    link.taxon_name___formatted_scientific_name ||
    link.taxon_name?.scientific_name ||
    link.taxon_name?.formatted_scientific_name ||
    ''
  );
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
  const dataProvider = useDataProvider();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = React.useMemo<PublicationFilters>(
    () => ({
      q: searchParams.get('q') || '',
      taxonQ: searchParams.get('taxonQ') || '',
      title: searchParams.get('title') || '',
      authorName: searchParams.get('authorName') || '',
      doi: searchParams.get('doi') || '',
      publicationYear: searchParams.get('publicationYear') || '',
      publisher: searchParams.get('publisher') || '',
      published: searchParams.get('published') || '',
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
  const [userMap, setUserMap] = React.useState<Record<number, string>>({});
  const [authorMap, setAuthorMap] = React.useState<Record<number, string>>({});
  const [publicationMap, setPublicationMap] = React.useState<Record<number, string>>({});
  const [taxonNameMap, setTaxonNameMap] = React.useState<Record<number, string>>({});
  const [taxonPublicationMap, setTaxonPublicationMap] = React.useState<
    Record<number, TaxonPublicationRecord[]>
  >({});
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
    const load = async () => {
      const publicationQuery: PublicationQuery = {
        q: filters.q,
        title: filters.title,
        authorName: filters.authorName,
        doi: filters.doi,
        publicationYear: filters.publicationYear,
        publisher: filters.publisher,
        published: filters.published,
        deleted: filters.deleted,
      };
      if (!filters.taxonQ) {
        return fetchPublications(page, perPage, sortField, sortOrder, publicationQuery);
      }
      const publicationIds = await fetchPublicationIdsByTaxonQuery(dataProvider, filters.taxonQ);
      if (!publicationIds.length) {
        return { data: [], total: 0 };
      }
      return fetchPublications(page, perPage, sortField, sortOrder, {
        ...publicationQuery,
        publicationIds,
      });
    };
    load()
      .then((result) => active && setState({ loading: false, error: null, data: result.data, total: result.total }))
      .catch((error: Error) => active && setState({ loading: false, error: error.message, data: [], total: 0 }));
    return () => {
      active = false;
    };
  }, [dataProvider, filters, page, perPage, sortField, sortOrder]);

  React.useEffect(() => {
    let active = true;
    const publicationIdsForTaxonLinks = uniqueNumericIds(
      state.data.map((record) => record.publication_id ?? record.id)
    );
    const userIds = uniqueNumericIds(state.data.map((record) => record.updated_by));
    const authorIds = uniqueNumericIds(
      state.data.flatMap((record) => record.author_ids ?? [])
    );
    const publicationIds = uniqueNumericIds(
      state.data.flatMap((record) => [record.parent_id, record.duplicate_of_id])
    );

    const loadReferences = async () => {
      const [nextUserMap, nextAuthorMap, nextPublicationMap, taxonPublications] = await Promise.all([
        fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
        fetchReferenceMap('authors', authorIds, 'author_id', 'abbreviation'),
        fetchReferenceMap('publications', publicationIds, 'publication_id', 'abbreviated_title'),
        fetchTaxonPublicationsViaDataProvider(dataProvider, publicationIdsForTaxonLinks),
      ]);
      const taxonNameIds = uniqueNumericIds(
        taxonPublications.map((link) => link.taxon_name_id)
      );
      const nextTaxonNameMap = await fetchReferenceMap(
        'taxon_names',
        taxonNameIds,
        'taxon_name_id',
        'scientific_name'
      );
      const fallbackTaxonNameMap =
        Object.keys(nextTaxonNameMap).length === 0
          ? await fetchReferenceMap('taxon_names', taxonNameIds, 'id', 'scientific_name')
          : {};
      if (!active) return;
      setUserMap(nextUserMap);
      setAuthorMap(nextAuthorMap);
      setPublicationMap(nextPublicationMap);
      setTaxonPublicationMap(mapTaxonPublicationsByPublication(taxonPublications));
      setTaxonNameMap({ ...fallbackTaxonNameMap, ...nextTaxonNameMap });
    };
    void loadReferences();
    return () => {
      active = false;
    };
  }, [dataProvider, state.data]);

  const totalPages = Math.max(Math.ceil(state.total / perPage), 1);
  const activeFilterBadges = [
    ...(filters.q ? [{ label: 'Publication query', value: filters.q }] : []),
    ...(filters.taxonQ ? [{ label: 'Linked taxon query', value: filters.taxonQ }] : []),
    ...(filters.title ? [{ label: 'Title', value: filters.title }] : []),
    ...(filters.authorName ? [{ label: 'Author', value: filters.authorName }] : []),
    ...(filters.doi ? [{ label: 'DOI', value: filters.doi }] : []),
    ...(filters.publicationYear ? [{ label: 'Year', value: filters.publicationYear }] : []),
    ...(filters.publisher ? [{ label: 'Publisher', value: filters.publisher }] : []),
    ...(filters.published ? [{ label: 'Published', value: filters.published }] : []),
    ...(filters.deleted ? [{ label: 'Deleted', value: filters.deleted }] : []),
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
      taxonQ: draftFilters.taxonQ || null,
      title: draftFilters.title || null,
      authorName: draftFilters.authorName || null,
      doi: draftFilters.doi || null,
      publicationYear: draftFilters.publicationYear || null,
      publisher: draftFilters.publisher || null,
      published: draftFilters.published || null,
      deleted: draftFilters.deleted || null,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setDraftFilters({
      q: '',
      taxonQ: '',
      title: '',
      authorName: '',
      doi: '',
      publicationYear: '',
      publisher: '',
      published: '',
      deleted: '',
    });
    setSearchParams(new URLSearchParams());
  };

  const exportColumnOptions = columnOptions.filter((column) => column.key !== 'actions');

  const getExportValue = (
    column: ColumnKey,
    record: PublicationRecord,
    exportUserMap: Record<number, string>,
    exportAuthorMap: Record<number, string>,
    exportPublicationMap: Record<number, string>,
    exportTaxonPublicationMap: Record<number, TaxonPublicationRecord[]>,
    exportTaxonNameMap: Record<number, string>
  ) => {
    const publicationId = record.publication_id ?? record.id ?? 0;
    switch (column) {
      case 'displayTitle':
        return record.display_title ?? '';
      case 'authorName':
        return record.author_name ?? '';
      case 'linkedTaxonNames':
        return (exportTaxonPublicationMap[publicationId] ?? [])
          .map((link) => getTaxonLabelFromLink(link, exportTaxonNameMap))
          .filter(Boolean)
          .filter((value, index, values) => values.indexOf(value) === index)
          .join('; ');
      case 'taxonPublicationLinks':
        return (exportTaxonPublicationMap[publicationId] ?? []).length;
      case 'authors':
        return (record.author_ids ?? [])
          .map((authorId) => exportAuthorMap[authorId])
          .filter(Boolean)
          .join(', ');
      case 'publicationYear':
        return record.publication_year ?? '';
      case 'publicationMonth':
        return record.publication_month ?? '';
      case 'publicationDay':
        return record.publication_day ?? '';
      case 'published':
        return renderBoolean(record.published);
      case 'abbreviatedTitle':
        return record.abbreviated_title ?? '';
      case 'title':
        return record.title ?? '';
      case 'doi':
        return record.doi ?? '';
      case 'publisher':
        return record.publisher ?? '';
      case 'parentPublication':
        return record.parent_id ? exportPublicationMap[record.parent_id] ?? '' : '';
      case 'publishedLocation':
        return record.published_location ?? '';
      case 'volume':
        return record.volume ?? '';
      case 'edition':
        return record.edition ?? '';
      case 'pages':
        return record.pages ?? '';
      case 'legacyId':
        return record.legacy_id ?? '';
      case 'isbn':
        return record.isbn ?? '';
      case 'issn':
        return record.issn ?? '';
      case 'tl2':
        return record.tl2 ?? '';
      case 'bhlUrl':
        return record.bhl_url ?? '';
      case 'referenceType':
        return record.reference_type ?? '';
      case 'referenceAuthorRole':
        return record.reference_author_role ?? '';
      case 'duplicateOf':
        return record.duplicate_of_id ? exportPublicationMap[record.duplicate_of_id] ?? '' : '';
      case 'language':
        return record.language ?? '';
      case 'notes':
        return record.notes ?? '';
      case 'badPublication':
        return renderBoolean(record.bad_publication);
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

  const buildExportCsv = (
    records: PublicationRecord[],
    exportUserMap: Record<number, string>,
    exportAuthorMap: Record<number, string>,
    exportPublicationMap: Record<number, string>,
    exportTaxonPublicationMap: Record<number, TaxonPublicationRecord[]>,
    exportTaxonNameMap: Record<number, string>
  ) =>
    [
      exportColumnOptions.map((column) => column.label),
      ...records.map((record) =>
        exportColumnOptions.map((column) =>
          getExportValue(
            column.key,
            record,
            exportUserMap,
            exportAuthorMap,
            exportPublicationMap,
            exportTaxonPublicationMap,
            exportTaxonNameMap
          )
        )
      ),
    ]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');

  const handleExport = async () => {
    if (isExporting || state.total === 0) return;
    try {
      setIsExporting(true);
      const publicationIdsByTaxon =
        filters.taxonQ
          ? await fetchPublicationIdsByTaxonQuery(dataProvider, filters.taxonQ)
          : undefined;
      if (filters.taxonQ && (!publicationIdsByTaxon || publicationIdsByTaxon.length === 0)) {
        return;
      }
      const exportPages = Math.max(Math.ceil(state.total / EXPORT_BATCH_SIZE), 1);
      const allRecords: PublicationRecord[] = [];
      for (let currentPage = 1; currentPage <= exportPages; currentPage += 1) {
        const result = await fetchPublications(currentPage, EXPORT_BATCH_SIZE, sortField, sortOrder, {
          q: filters.q,
          title: filters.title,
          authorName: filters.authorName,
          doi: filters.doi,
          publicationYear: filters.publicationYear,
          publisher: filters.publisher,
          published: filters.published,
          deleted: filters.deleted,
          publicationIds: publicationIdsByTaxon,
        });
        allRecords.push(...result.data);
      }
      const userIds = uniqueNumericIds(allRecords.map((record) => record.updated_by));
      const authorIds = uniqueNumericIds(
        allRecords.flatMap((record) => record.author_ids ?? [])
      );
      const publicationReferenceIds = uniqueNumericIds(
        allRecords.flatMap((record) => [record.parent_id, record.duplicate_of_id])
      );
      const exportPublicationIds = uniqueNumericIds(
        allRecords.map((record) => record.publication_id ?? record.id)
      );
      const [exportUserMap, exportAuthorMap, exportPublicationMap, exportTaxonPublications] = await Promise.all([
        fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
        fetchReferenceMap('authors', authorIds, 'author_id', 'abbreviation'),
        fetchReferenceMap('publications', publicationReferenceIds, 'publication_id', 'abbreviated_title'),
        fetchTaxonPublications(exportPublicationIds),
      ]);
      const exportTaxonNameIds = uniqueNumericIds(
        exportTaxonPublications.map((link) => link.taxon_name_id)
      );
      const exportTaxonNameMap = await fetchReferenceMap(
        'taxon_names',
        exportTaxonNameIds,
        'taxon_name_id',
        'scientific_name'
      );
      const csv = buildExportCsv(
        allRecords,
        exportUserMap,
        exportAuthorMap,
        exportPublicationMap,
        mapTaxonPublicationsByPublication(exportTaxonPublications),
        exportTaxonNameMap
      );
      downloadCsv(`publications_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCellContent = (column: ColumnKey, record: PublicationRecord) => {
    const publicationId = record.publication_id ?? record.id ?? 0;
    const linkedTaxa = (taxonPublicationMap[publicationId] ?? [])
      .map((link, index) => ({
        key: link.taxon_publication_id ?? link.id ?? `${publicationId}-${index}`,
        taxonNameId: toNumberId(link.taxon_name_id),
        label: getTaxonLabelFromLink(link, taxonNameMap),
      }))
      .filter((taxon) => Boolean(taxon.label));
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
      case 'linkedTaxonNames': {
        if (!linkedTaxa.length) {
          return <span className="text-muted-foreground">No linked taxa</span>;
        }
        const visibleTaxa = linkedTaxa.slice(0, 3);
        const hiddenCount = linkedTaxa.length - visibleTaxa.length;
        return (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            {visibleTaxa.map((taxon) => (
              taxon.taxonNameId ? (
                <Link
                  key={taxon.key}
                  to={`/taxon_names/${taxon.taxonNameId}/show`}
                  className="rounded-md border border-border px-2 py-0.5 text-xs hover:bg-accent"
                >
                  {taxon.label}
                </Link>
              ) : (
                <span
                  key={taxon.key}
                  className="rounded-md border border-border px-2 py-0.5 text-xs"
                >
                  {taxon.label}
                </span>
              )
            ))}
            {hiddenCount > 0 ? (
              <Badge variant="outline">+{hiddenCount} more</Badge>
            ) : null}
          </span>
        );
      }
      case 'taxonPublicationLinks':
        return (taxonPublicationMap[publicationId] ?? []).length;
      case 'authors':
        return (record.author_ids ?? [])
          .map((authorId) => authorMap[authorId])
          .filter(Boolean)
          .join(', ');
      case 'publicationYear':
        return record.publication_year ?? '';
      case 'publicationMonth':
        return record.publication_month ?? '';
      case 'publicationDay':
        return record.publication_day ?? '';
      case 'published':
        return renderBoolean(record.published);
      case 'abbreviatedTitle':
        return record.abbreviated_title ?? '';
      case 'title':
        return record.title ?? '';
      case 'doi':
        return record.doi ?? '';
      case 'publisher':
        return record.publisher ?? '';
      case 'parentPublication':
        return record.parent_id ? publicationMap[record.parent_id] ?? '' : '';
      case 'publishedLocation':
        return record.published_location ?? '';
      case 'volume':
        return record.volume ?? '';
      case 'edition':
        return record.edition ?? '';
      case 'pages':
        return record.pages ?? '';
      case 'legacyId':
        return record.legacy_id ?? '';
      case 'isbn':
        return record.isbn ?? '';
      case 'issn':
        return record.issn ?? '';
      case 'tl2':
        return record.tl2 ?? '';
      case 'bhlUrl':
        return record.bhl_url ?? '';
      case 'referenceType':
        return record.reference_type ?? '';
      case 'referenceAuthorRole':
        return record.reference_author_role ?? '';
      case 'duplicateOf':
        return record.duplicate_of_id ? publicationMap[record.duplicate_of_id] ?? '' : '';
      case 'language':
        return record.language ?? '';
      case 'notes':
        return record.notes ?? '';
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
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, q: event.target.value }))
                }
                placeholder="Search publications"
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={draftFilters.title}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Filter by title"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Author</label>
            <input
              value={draftFilters.authorName}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, authorName: event.target.value }))
              }
              placeholder="Filter by publication author"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">DOI</label>
            <input
              value={draftFilters.doi}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, doi: event.target.value }))
              }
              placeholder="Filter by DOI"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <input
              value={draftFilters.publicationYear}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, publicationYear: event.target.value }))
              }
              placeholder="e.g. 1998"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Publisher</label>
            <input
              value={draftFilters.publisher}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, publisher: event.target.value }))
              }
              placeholder="Filter by publisher"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Linked taxon search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={draftFilters.taxonQ}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, taxonQ: event.target.value }))
                }
                placeholder="Search linked taxon names"
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Published</label>
            <select
              value={draftFilters.published}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, published: event.target.value }))
              }
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Deleted</label>
            <select
              value={draftFilters.deleted}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, deleted: event.target.value }))
              }
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
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
