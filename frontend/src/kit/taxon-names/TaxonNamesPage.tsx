import * as React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Search,
} from 'lucide-react';
import {
  useCanAccess,
  useDataTableCallbacksContext,
  useDataTableSelectedIdsContext,
} from 'ra-core';
import { Link, useSearchParams } from 'react-router-dom';
import { ColumnsButton } from '@/components/admin/columns-button';
import { DataTable } from '@/components/admin/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { useDataProvider, useNotify } from 'react-admin';
import authProvider from '../app/authProvider';
import AuthorizedButtonLink from '../shared/AuthorizedButtonLink';
import RecordActionButtons from '../shared/RecordActionButtons';
import ConservationType from '../shared/choices/ConservationType';
import PublicationStatus from '../shared/choices/PublicationStatus';
import TaxonRank from '../shared/choices/TaxonRank';
import { useCanBulkDelete } from '../shared/useCanBulkDelete';
import { BACKEND_URL } from '../../config';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

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
  form_desc_mn?: string | number;
  form_desc_dy?: string | number;
  publication_id?: number;
  volume_information?: string;
  publication_status?: string;
  review?: boolean;
  is_autonym?: boolean;
  is_current?: boolean;
  is_wa_recognised?: boolean;
  vernacular?: string;
  all_vernaculars?: string;
  review_reason?: string;
  uninomial?: string;
  specific_epithet?: string;
  infraspecific_epithet?: string;
  origin?: string;
  comments?: string;
  contributed_by?: string;
  contributed_on?: string;
  validated?: boolean;
  source?: string;
  external_id?: string;
  family_code?: string;
  editor?: string;
  naturalised_status?: string;
  naturalised_certainty?: boolean;
  is_eradicated?: string;
  naturalised_comments?: string;
  linear_sequence?: number;
  family_nid?: number;
  created_on?: string;
  created_by?: number;
  notes?: string;
  admin_comment?: string;
  authorised_by?: string;
  authorised_on?: string;
  updated_by?: number;
  updated_on?: string;
  deleted?: boolean;
};

type TaxonNamesResponse = {
  data: TaxonNameRecord[];
  total: number;
};

type SortOrder = 'ASC' | 'DESC';

type ColumnKey =
  | 'id'
  | 'name'
  | 'legacyId'
  | 'scientificName'
  | 'canonicalName'
  | 'rank'
  | 'kingdom'
  | 'division'
  | 'phylum'
  | 'class'
  | 'order'
  | 'family'
  | 'genus'
  | 'subgenus'
  | 'species'
  | 'subspecies'
  | 'author'
  | 'yearPublished'
  | 'monthPublished'
  | 'dayPublished'
  | 'publication'
  | 'volumeInformation'
  | 'status'
  | 'reviewFlag'
  | 'waCensusField'
  | 'isAutonym'
  | 'vernaculars'
  | 'vernacular'
  | 'conservationCodes'
  | 'reviewReason'
  | 'uninomial'
  | 'specificEpithet'
  | 'infraspecificEpithet'
  | 'origin'
  | 'comments'
  | 'contributedBy'
  | 'contributedOn'
  | 'validated'
  | 'source'
  | 'externalId'
  | 'familyCode'
  | 'editor'
  | 'naturalisedStatus'
  | 'naturalisedCertainty'
  | 'isEradicated'
  | 'naturalisedComments'
  | 'linearSequence'
  | 'authorisedBy'
  | 'authorisedOn'
  | 'createdBy'
  | 'created'
  | 'notes'
  | 'adminComment'
  | 'updatedBy'
  | 'updated'
  | 'deleted'
  | 'actions';

type TaxonNameFilters = {
  q: string;
  id: string;
  legacyId: string;
  scientificName: string;
  author: string;
  yearPublished: string;
  publicationName: string;
  volumeInformation: string;
  vernacular: string;
  division: string;
  phylum: string;
  taxonClass: string;
  order: string;
  family: string;
  genus: string;
  subgenus: string;
  species: string;
  subspecies: string;
  uninomial: string;
  infraspecificEpithet: string;
  specificEpithet: string;
  acceptedName: string;
  reviewReason: string;
  taxonRank: string;
  conservationCode: string;
  authority: string;
  conservationCodeActive: string;
  publicationStatus: string;
  review: string;
  isCurrent: string;
  waCensus: string;
  validated: string;
  isAutonym: string;
  deleted: string;
};

const DEFAULT_PER_PAGE = 25;
const PER_PAGE_OPTIONS = [15, 25, 50, 100] as const;
const TABLE_STORE_KEY = 'taxon_names.kit.datatable.v4';
const DEFAULT_SORT_FIELD = 'updated_on';
const DEFAULT_SORT_ORDER: SortOrder = 'DESC';
const defaultColumns: ColumnKey[] = [
  'id',
  'name',
  'rank',
  'kingdom',
  'yearPublished',
  'status',
  'updated',
  'actions',
];
const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'id', label: 'NomosID' },
  { key: 'name', label: 'Name' },
  { key: 'rank', label: 'Rank' },
  { key: 'kingdom', label: 'Kingdom' },
  { key: 'yearPublished', label: 'Year published' },
  { key: 'status', label: 'Status' },
  { key: 'updated', label: 'Updated on' },
  { key: 'legacyId', label: 'LegacyID' },
  { key: 'canonicalName', label: 'Canonical name' },
  { key: 'division', label: 'Division' },
  { key: 'phylum', label: 'Phylum' },
  { key: 'class', label: 'Class' },
  { key: 'order', label: 'Order' },
  { key: 'family', label: 'Family' },
  { key: 'genus', label: 'Genus' },
  { key: 'subgenus', label: 'Subgenus' },
  { key: 'species', label: 'Species' },
  { key: 'subspecies', label: 'Subspecies' },
  { key: 'author', label: 'Author' },
  { key: 'monthPublished', label: 'Month published' },
  { key: 'dayPublished', label: 'Day published' },
  { key: 'publication', label: 'Publication' },
  { key: 'volumeInformation', label: 'Volume information' },
  { key: 'reviewFlag', label: 'Review?' },
  { key: 'waCensusField', label: 'WA census' },
  { key: 'isAutonym', label: 'Is autonym?' },
  { key: 'vernaculars', label: 'Vernaculars' },
  { key: 'vernacular', label: 'Vernacular' },
  { key: 'conservationCodes', label: 'Conservation codes' },
  { key: 'reviewReason', label: 'Review reason' },
  { key: 'uninomial', label: 'Uninomial' },
  { key: 'specificEpithet', label: 'Specific epithet' },
  { key: 'infraspecificEpithet', label: 'Infraspecific epithet' },
  { key: 'origin', label: 'Origin' },
  { key: 'comments', label: 'Comments' },
  { key: 'validated', label: 'Validated' },
  { key: 'source', label: 'Source' },
  { key: 'externalId', label: 'External ID' },
  { key: 'familyCode', label: 'Family code' },
  { key: 'editor', label: 'Editor' },
  { key: 'naturalisedStatus', label: 'Naturalised status' },
  { key: 'naturalisedCertainty', label: 'Naturalised certainty' },
  { key: 'isEradicated', label: 'Is eradicated' },
  { key: 'naturalisedComments', label: 'Naturalised comments' },
  { key: 'linearSequence', label: 'Linear sequence' },
  { key: 'createdBy', label: 'Created by' },
  { key: 'created', label: 'Created' },
  { key: 'notes', label: 'Notes' },
  { key: 'adminComment', label: 'Admin comment' },
  { key: 'updatedBy', label: 'Updated by' },
  { key: 'deleted', label: 'Deleted' },
  { key: 'authorisedBy', label: 'Authorised by' },
  { key: 'authorisedOn', label: 'Authorised on' },
  { key: 'contributedBy', label: 'Contributed by' },
  { key: 'contributedOn', label: 'Contributed on' },
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
  id: 'taxon_name_id',
  name: 'scientific_name',
  legacyId: 'legacy_id',
  scientificName: 'scientific_name',
  canonicalName: 'canonical_name',
  rank: 'taxon_rank___rank_name',
  kingdom: 'kingdom___kingdom_name',
  author: 'author',
  yearPublished: 'form_desc_yr',
  monthPublished: 'form_desc_mn',
  dayPublished: 'form_desc_dy',
  publication: 'publication___title',
  volumeInformation: 'volume_information',
  reviewFlag: 'review',
  waCensusField: 'is_wa_recognised',
  isAutonym: 'is_autonym',
  vernaculars: 'all_vernaculars',
  vernacular: 'vernacular',
  reviewReason: 'review_reason',
  uninomial: 'uninomial',
  specificEpithet: 'specific_epithet',
  infraspecificEpithet: 'infraspecific_epithet',
  origin: 'origin',
  comments: 'comments',
  contributedBy: 'contributed_by',
  contributedOn: 'contributed_on',
  validated: 'validated',
  source: 'source',
  externalId: 'external_id',
  familyCode: 'family_code',
  editor: 'editor',
  naturalisedStatus: 'naturalised_status',
  naturalisedCertainty: 'naturalised_certainty',
  isEradicated: 'is_eradicated',
  naturalisedComments: 'naturalised_comments',
  linearSequence: 'linear_sequence',
  authorisedBy: 'authorised_by',
  authorisedOn: 'authorised_on',
  createdBy: 'created_by',
  created: 'created_on',
  notes: 'notes',
  adminComment: 'admin_comment',
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

const buildFilterObject = (filters: TaxonNameFilters) => {
  const nextFilter: Record<string, string | boolean> = {};
  const trimmedQuery = filters.q.trim();
  const trimmedId = filters.id.trim();
  const isExactNomosIdSearch = /^\d+$/.test(trimmedQuery);

  if (trimmedQuery && !isExactNomosIdSearch) {
    nextFilter.q = trimmedQuery;
  }
  if (trimmedId) {
    nextFilter.taxon_name_id = trimmedId;
  } else if (isExactNomosIdSearch) {
    nextFilter.taxon_name_id = trimmedQuery;
  }
  if (filters.legacyId) {
    nextFilter.legacy_id__contains = filters.legacyId;
  }
  if (filters.scientificName) {
    nextFilter.scientific_name__contains = filters.scientificName;
  }
  if (filters.author) {
    nextFilter.author__contains = filters.author;
  }
  if (filters.yearPublished) {
    nextFilter.form_desc_yr = filters.yearPublished;
  }
  if (filters.publicationName) {
    nextFilter.publication___title__contains = filters.publicationName;
  }
  if (filters.volumeInformation) {
    nextFilter.volume_information__contains = filters.volumeInformation;
  }
  if (filters.vernacular) {
    nextFilter.all_vernaculars__contains = filters.vernacular;
  }
  if (filters.division) {
    nextFilter.division = filters.division;
  }
  if (filters.phylum) {
    nextFilter.phylum = filters.phylum;
  }
  if (filters.taxonClass) {
    nextFilter.class = filters.taxonClass;
  }
  if (filters.order) {
    nextFilter.order = filters.order;
  }
  if (filters.family) {
    nextFilter.family = filters.family;
  }
  if (filters.genus) {
    nextFilter.genus = filters.genus;
  }
  if (filters.subgenus) {
    nextFilter.subgenus = filters.subgenus;
  }
  if (filters.species) {
    nextFilter.species = filters.species;
  }
  if (filters.subspecies) {
    nextFilter.subspecies = filters.subspecies;
  }
  if (filters.uninomial) {
    nextFilter.uninomial__contains = filters.uninomial;
  }
  if (filters.infraspecificEpithet) {
    nextFilter.infraspecific_epithet__contains = filters.infraspecificEpithet;
  }
  if (filters.specificEpithet) {
    nextFilter.specific_epithet__contains = filters.specificEpithet;
  }
  if (filters.acceptedName) {
    nextFilter.cross_referenced_old_name___new_name___scientific_name__contains =
      filters.acceptedName;
  }
  if (filters.reviewReason) {
    nextFilter.review_reason__contains = filters.reviewReason;
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
  if (filters.conservationCodeActive) {
    nextFilter.conscode_taxons___isactive =
      filters.conservationCodeActive === 'true';
  }
  if (filters.publicationStatus) {
    nextFilter.publication_status = filters.publicationStatus;
  }
  if (filters.review) {
    nextFilter.review = filters.review === 'true';
  }
  if (filters.isCurrent) {
    nextFilter.is_current = filters.isCurrent === 'true';
  }
  if (filters.waCensus) {
    nextFilter.is_wa_recognised = filters.waCensus === 'true';
  }
  if (filters.validated) {
    nextFilter.validated = filters.validated === 'true';
  }
  if (filters.isAutonym) {
    nextFilter.is_autonym = filters.isAutonym === 'true';
  }
  if (filters.deleted) {
    nextFilter.deleted = filters.deleted === 'true';
  }

  return nextFilter;
};

const fetchTaxonNames = async (
  page: number,
  perPage: number,
  sortField: string,
  sortOrder: SortOrder,
  filters: TaxonNameFilters,
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
  } satisfies TaxonNamesResponse;
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

const ANCESTOR_RESOURCES = [
  'Division',
  'Phylum',
  'Class',
  'Order',
  'Family',
  'Genus',
  'Subgenus',
  'Species',
  'Subspecies',
] as const;

type AncestorResource = (typeof ANCESTOR_RESOURCES)[number];

const fetchAncestorMap = async (
  resource: AncestorResource,
  ids: number[],
  retryOnAuthError = true
) => {
  if (!ids.length) {
    return {} as Record<number, string>;
  }

  const sort = encodeURIComponent(JSON.stringify(['id', 'ASC']));
  const range = encodeURIComponent(JSON.stringify([0, Math.max(ids.length, 1) + 20]));
  const filter = encodeURIComponent(JSON.stringify({ id: ids }));
  const response = await fetch(
    `${BACKEND_URL}/taxon_names_ancestors/${resource}?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );

  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchAncestorMap(resource, ids, false);
  }

  if (!response.ok) {
    return {};
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    return {};
  }

  return rows.reduce((acc: Record<number, string>, row: Record<string, unknown>) => {
    const key = Number(row.id);
    const value = String(row.ancestor_name__formatted_scientific_name ?? '');
    if (!Number.isNaN(key) && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const fetchConservationCodeMap = async (
  taxonNameIds: number[],
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
    JSON.stringify({ taxon_name_id: taxonNameIds, isactive: true })
  );
  const response = await fetch(
    `${BACKEND_URL}/conscode_taxons?sort=${sort}&range=${range}&filter=${filter}`,
    { headers: buildHeaders() }
  );

  if (response.status === 401 && retryOnAuthError) {
    await authProvider.checkError({ status: 401 });
    return fetchConservationCodeMap(taxonNameIds, false);
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

  const getConservationLabel = (row: Record<string, unknown>, codeId: number) => {
    const directValue =
      typeof row.conservation_code___conservation_code_value === 'string'
        ? row.conservation_code___conservation_code_value
        : typeof row.conservation_code_value === 'string'
          ? row.conservation_code_value
          : typeof (row.conservation_code as Record<string, unknown> | undefined)
              ?.conservation_code_value === 'string'
            ? String(
                (row.conservation_code as Record<string, unknown>).conservation_code_value
              )
            : codeMap[codeId];

    const authority =
      typeof row.conservation_code___authorising_org === 'string'
        ? row.conservation_code___authorising_org
        : typeof row.authorising_org === 'string'
          ? row.authorising_org
          : typeof (row.conservation_code as Record<string, unknown> | undefined)
              ?.authorising_org === 'string'
            ? String((row.conservation_code as Record<string, unknown>).authorising_org)
            : '';

    if (!directValue) {
      return '';
    }

    return authority ? `${authority}: ${directValue}` : directValue;
  };

  return rows.reduce((acc: Record<number, string[]>, row: Record<string, unknown>) => {
    const taxonId = Number(row.taxon_name_id);
    const codeId = Number(row.conservation_code_id);
    const label = getConservationLabel(row, codeId);
    if (Number.isNaN(taxonId) || !label) {
      return acc;
    }

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

const renderName = (record: TaxonNameRecord) => {
  if (record.formatted_scientific_name) {
    return (
      <span
        dangerouslySetInnerHTML={{ __html: record.formatted_scientific_name }}
      />
    );
  }

  return record.scientific_name || 'Untitled';
};

const getTaxonNameId = (record: TaxonNameRecord) =>
  record.taxon_name_id ?? record.id ?? 0;

const textOrEmpty = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? '' : String(value);

const booleanOrEmpty = (value?: boolean) =>
  value === undefined ? '' : value ? 'Yes' : 'No';

const publicationStatusOptions = [
  { label: 'Any status', value: '' },
  ...PublicationStatus.map((option) => ({
    label: option.name,
    value: option.id,
  })),
];

const publicationStatusLabelMap = PublicationStatus.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.id] = option.name;
    return acc;
  },
  {}
);

const getPublicationStatusLabel = (value?: string | null) =>
  value ? publicationStatusLabelMap[value] ?? value : '';

const booleanOptions = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

const getBooleanLabel = (value: string) => {
  if (value === 'true') {
    return 'Yes';
  }
  if (value === 'false') {
    return 'No';
  }
  return '';
};

const EXPORT_BATCH_SIZE = 500;

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

const stripHtml = (value?: string | null) =>
  value ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';

type ExportMaps = {
  publicationMap: Record<number, string>;
  userMap: Record<number, string>;
  ancestorMaps: Partial<Record<AncestorResource, Record<number, string>>>;
  conservationCodeMap: Record<number, string[]>;
};

const getExportValue = (
  column: ColumnKey,
  record: TaxonNameRecord,
  maps: ExportMaps
) => {
  const taxonNameId = getTaxonNameId(record);

  switch (column) {
    case 'id':
      return taxonNameId;
    case 'name':
      return stripHtml(record.formatted_scientific_name) || record.scientific_name || '';
    case 'legacyId':
      return record.legacy_id ?? '';
    case 'scientificName':
      return record.scientific_name ?? '';
    case 'canonicalName':
      return record.canonical_name ?? '';
    case 'rank':
      return typeof record.taxon_rank === 'string'
        ? record.taxon_rank
        : record.taxon_rank?.rank_name ?? '';
    case 'kingdom':
      return typeof record.kingdom === 'string'
        ? record.kingdom
        : record.kingdom?.kingdom_name ?? '';
    case 'division':
      return stripHtml(maps.ancestorMaps.Division?.[taxonNameId]);
    case 'phylum':
      return stripHtml(maps.ancestorMaps.Phylum?.[taxonNameId]);
    case 'class':
      return stripHtml(maps.ancestorMaps.Class?.[taxonNameId]);
    case 'order':
      return stripHtml(maps.ancestorMaps.Order?.[taxonNameId]);
    case 'family':
      return stripHtml(maps.ancestorMaps.Family?.[taxonNameId]);
    case 'genus':
      return stripHtml(maps.ancestorMaps.Genus?.[taxonNameId]);
    case 'subgenus':
      return stripHtml(maps.ancestorMaps.Subgenus?.[taxonNameId]);
    case 'species':
      return stripHtml(maps.ancestorMaps.Species?.[taxonNameId]);
    case 'subspecies':
      return stripHtml(maps.ancestorMaps.Subspecies?.[taxonNameId]);
    case 'author':
      return record.author ?? '';
    case 'yearPublished':
      return record.form_desc_yr ?? '';
    case 'monthPublished':
      return record.form_desc_mn ?? '';
    case 'dayPublished':
      return record.form_desc_dy ?? '';
    case 'publication':
      return (record.publication_id && maps.publicationMap[record.publication_id]) ||
        (record.publication_id ? `Publication ${record.publication_id}` : '');
    case 'volumeInformation':
      return record.volume_information ?? '';
    case 'status':
      return [
        getPublicationStatusLabel(record.publication_status),
        record.review ? 'Review' : '',
        record.is_current ? 'Current' : '',
      ]
        .filter(Boolean)
        .join(', ');
    case 'reviewFlag':
      return booleanOrEmpty(record.review);
    case 'waCensusField':
      return booleanOrEmpty(record.is_wa_recognised);
    case 'isAutonym':
      return booleanOrEmpty(record.is_autonym);
    case 'vernaculars':
      return record.all_vernaculars ?? '';
    case 'vernacular':
      return record.vernacular ?? '';
    case 'conservationCodes':
      return maps.conservationCodeMap[taxonNameId]?.join('; ') ?? '';
    case 'reviewReason':
      return record.review_reason ?? '';
    case 'uninomial':
      return record.uninomial ?? '';
    case 'specificEpithet':
      return record.specific_epithet ?? '';
    case 'infraspecificEpithet':
      return record.infraspecific_epithet ?? '';
    case 'origin':
      return record.origin ?? '';
    case 'comments':
      return record.comments ?? '';
    case 'contributedBy':
      return record.contributed_by ?? '';
    case 'contributedOn':
      return formatDate(record.contributed_on);
    case 'validated':
      return booleanOrEmpty(record.validated);
    case 'source':
      return record.source ?? '';
    case 'externalId':
      return record.external_id ?? '';
    case 'familyCode':
      return record.family_code ?? '';
    case 'editor':
      return record.editor ?? '';
    case 'naturalisedStatus':
      return record.naturalised_status ?? '';
    case 'naturalisedCertainty':
      return booleanOrEmpty(record.naturalised_certainty);
    case 'isEradicated':
      return record.is_eradicated ?? '';
    case 'naturalisedComments':
      return record.naturalised_comments ?? '';
    case 'linearSequence':
      return record.linear_sequence ?? '';
    case 'authorisedBy':
      return record.authorised_by ?? '';
    case 'authorisedOn':
      return formatDate(record.authorised_on);
    case 'createdBy':
      return (record.created_by && maps.userMap[record.created_by]) ||
        (record.created_by ? `User ${record.created_by}` : '');
    case 'created':
      return formatDate(record.created_on);
    case 'notes':
      return record.notes ?? '';
    case 'adminComment':
      return record.admin_comment ?? '';
    case 'updatedBy':
      return (record.updated_by && maps.userMap[record.updated_by]) ||
        (record.updated_by ? `User ${record.updated_by}` : '');
    case 'updated':
      return formatDate(record.updated_on);
    case 'deleted':
      return booleanOrEmpty(record.deleted);
    case 'actions':
      return '';
    default:
      return '';
  }
};

const buildExportCsv = (
  records: TaxonNameRecord[],
  columns: Array<{ key: ColumnKey; label: string }>,
  maps: ExportMaps
) => {
  const headers = columns.map((column) => column.label);

  const rows = records.map((record) =>
    columns.map((column) => getExportValue(column.key, record, maps))
  );

  return [headers, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n');
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

const TaxonNamesBulkActionsToolbar = ({
  onDeleted,
}: {
  onDeleted: () => void;
}) => {
  const selectedIds = useDataTableSelectedIdsContext() ?? [];
  const { onSelect } = useDataTableCallbacksContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const clearSelection = React.useCallback(() => {
    onSelect?.([]);
  }, [onSelect]);

  const handleDelete = React.useCallback(async () => {
    if (!selectedIds.length || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} taxon name${selectedIds.length === 1 ? '' : 's'}?`
    );
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await dataProvider.deleteMany('taxon_names', { ids: selectedIds });
      notify(
        `${selectedIds.length} taxon name${selectedIds.length === 1 ? '' : 's'} deleted`,
        { type: 'success' }
      );
      clearSelection();
      onDeleted();
    } catch (error) {
      notify('Failed to delete selected taxon names', { type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [clearSelection, dataProvider, isDeleting, notify, onDeleted, selectedIds]);

  if (!selectedIds.length) {
    return null;
  }

  return (
    <Card className="fixed bottom-3 left-1/2 z-10 flex w-[min(90vw,28rem)] -translate-x-1/2 items-center justify-between gap-3 border-border bg-background px-4 py-3 shadow-lg">
      <div className="text-sm text-muted-foreground">
        {selectedIds.length} selected
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clearSelection}>
          Clear
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete selected'}
        </Button>
      </div>
    </Card>
  );
};

const TaxonNamesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const { canAccess: canViewDeleted } = useCanAccess({
    resource: 'taxon_names',
    action: 'viewdeleted',
  });
  const { canAccess: canUseDeletedFilter } = useCanAccess({
    resource: 'taxon_names',
    action: 'deletedfilter',
  });
  const canBulkDelete = useCanBulkDelete();
  const filters = React.useMemo<TaxonNameFilters>(
    () => ({
      q: searchParams.get('q') || '',
      id: searchParams.get('id') || '',
      legacyId: searchParams.get('legacy_id') || '',
      scientificName: searchParams.get('scientific_name') || '',
      author: searchParams.get('author') || '',
      yearPublished: searchParams.get('form_desc_yr') || '',
      publicationName: searchParams.get('publication_name') || '',
      volumeInformation: searchParams.get('volume_information') || '',
      vernacular: searchParams.get('vernacular') || '',
      division: searchParams.get('division') || '',
      phylum: searchParams.get('phylum') || '',
      taxonClass: searchParams.get('taxon_class') || '',
      order: searchParams.get('order') || '',
      family: searchParams.get('family') || '',
      genus: searchParams.get('genus') || '',
      subgenus: searchParams.get('subgenus') || '',
      species: searchParams.get('species') || '',
      subspecies: searchParams.get('subspecies') || '',
      uninomial: searchParams.get('uninomial') || '',
      infraspecificEpithet: searchParams.get('infraspecific_epithet') || '',
      specificEpithet: searchParams.get('specific_epithet') || '',
      acceptedName: searchParams.get('accepted_name') || '',
      reviewReason: searchParams.get('review_reason') || '',
      taxonRank: searchParams.get('taxon_rank') || '',
      conservationCode: searchParams.get('conservation_code') || '',
      authority: searchParams.get('authority') || '',
      conservationCodeActive: searchParams.get('conservation_code_active') || '',
      publicationStatus: searchParams.get('publication_status') || '',
      review: searchParams.get('review') || '',
      isCurrent: searchParams.get('is_current') || '',
      waCensus: searchParams.get('is_wa_recognised') || '',
      validated: searchParams.get('validated') || '',
      isAutonym: searchParams.get('is_autonym') || '',
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
  const [publicationMap, setPublicationMap] = React.useState<Record<number, string>>({});
  const [userMap, setUserMap] = React.useState<Record<number, string>>({});
  const [ancestorMaps, setAncestorMaps] = React.useState<
    Partial<Record<AncestorResource, Record<number, string>>>
  >({});
  const [conservationCodeMap, setConservationCodeMap] = React.useState<
    Record<number, string[]>
  >({});
  const [isExporting, setIsExporting] = React.useState(false);
  const [reloadNonce, setReloadNonce] = React.useState(0);
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
  }, [filters, page, perPage, reloadNonce, sortField, sortOrder]);

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
          .flatMap((record) => [record.created_by, record.updated_by])
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
      fetchConservationCodeMap(taxonNameIds),
      ...ANCESTOR_RESOURCES.map((resource) => fetchAncestorMap(resource, taxonNameIds)),
    ]).then(([publications, users, conservationCodes, ...ancestorResults]) => {
      if (!active) {
        return;
      }
      setPublicationMap(publications);
      setUserMap(users);
      setConservationCodeMap(conservationCodes);
      setAncestorMaps(
        ancestorResults.reduce<Partial<Record<AncestorResource, Record<number, string>>>>(
          (acc, result, index) => {
            acc[ANCESTOR_RESOURCES[index]] = result;
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
        filters.q
          ? {
              label: /^\d+$/.test(filters.q) ? 'NomosID' : 'Query',
              value: filters.q,
            }
          : null,
        filters.id ? { label: 'NomosID', value: filters.id } : null,
        filters.legacyId ? { label: 'LegacyID', value: filters.legacyId } : null,
        filters.scientificName
          ? { label: 'Scientific name', value: filters.scientificName }
          : null,
        filters.author ? { label: 'Author', value: filters.author } : null,
        filters.taxonRank ? { label: 'Taxon rank', value: filters.taxonRank } : null,
        filters.publicationStatus
          ? { label: 'Status', value: filters.publicationStatus }
          : null,
        filters.review ? { label: 'Review', value: getBooleanLabel(filters.review) } : null,
        filters.isCurrent
          ? { label: 'Current', value: getBooleanLabel(filters.isCurrent) }
          : null,
        filters.waCensus
          ? { label: 'WA census', value: getBooleanLabel(filters.waCensus) }
          : null,
        filters.yearPublished
          ? { label: 'Year', value: filters.yearPublished }
          : null,
        filters.publicationName
          ? { label: 'Publication', value: filters.publicationName }
          : null,
        filters.volumeInformation
          ? { label: 'Volume', value: filters.volumeInformation }
          : null,
        filters.vernacular ? { label: 'Vernacular', value: filters.vernacular } : null,
        filters.division ? { label: 'Division', value: filters.division } : null,
        filters.phylum ? { label: 'Phylum', value: filters.phylum } : null,
        filters.taxonClass ? { label: 'Class', value: filters.taxonClass } : null,
        filters.order ? { label: 'Order', value: filters.order } : null,
        filters.family ? { label: 'Family', value: filters.family } : null,
        filters.genus ? { label: 'Genus', value: filters.genus } : null,
        filters.subgenus ? { label: 'Subgenus', value: filters.subgenus } : null,
        filters.species ? { label: 'Species', value: filters.species } : null,
        filters.subspecies ? { label: 'Subspecies', value: filters.subspecies } : null,
        filters.uninomial ? { label: 'Uninomial', value: filters.uninomial } : null,
        filters.specificEpithet
          ? { label: 'Specific epithet', value: filters.specificEpithet }
          : null,
        filters.infraspecificEpithet
          ? {
              label: 'Infraspecific epithet',
              value: filters.infraspecificEpithet,
            }
          : null,
        filters.acceptedName
          ? { label: 'Accepted name', value: filters.acceptedName }
          : null,
        filters.reviewReason
          ? { label: 'Review reason', value: filters.reviewReason }
          : null,
        filters.conservationCode
          ? { label: 'Conservation code', value: filters.conservationCode }
          : null,
        filters.authority ? { label: 'Authority', value: filters.authority } : null,
        filters.conservationCodeActive
          ? {
              label: 'Conservation active',
              value: getBooleanLabel(filters.conservationCodeActive),
            }
          : null,
        filters.validated
          ? { label: 'Validated', value: getBooleanLabel(filters.validated) }
          : null,
        filters.isAutonym
          ? { label: 'Autonym', value: getBooleanLabel(filters.isAutonym) }
          : null,
        canUseDeletedFilter && filters.deleted
          ? { label: 'Deleted only', value: 'Yes' }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [canUseDeletedFilter, filters]
  );

  const updateParams = (
    next: Partial<TaxonNameFilters> & {
      page?: number;
      perPage?: number;
      sortField?: string;
      sortOrder?: SortOrder;
      resetPage?: boolean;
    }
  ) => {
    const params = new URLSearchParams(searchParams);

    if (typeof next.page === 'number') {
      params.set('page', String(next.page));
    }
    if (typeof next.perPage === 'number') {
      params.set('perPage', String(next.perPage));
    }
    if (typeof next.sortField === 'string') {
      params.set('sortField', next.sortField);
    }
    if (typeof next.sortOrder === 'string') {
      params.set('sortOrder', next.sortOrder);
    }
    ([
      ['q', next.q],
      ['id', next.id],
      ['legacy_id', next.legacyId],
      ['scientific_name', next.scientificName],
      ['author', next.author],
      ['form_desc_yr', next.yearPublished],
      ['publication_name', next.publicationName],
      ['volume_information', next.volumeInformation],
      ['vernacular', next.vernacular],
      ['division', next.division],
      ['phylum', next.phylum],
      ['taxon_class', next.taxonClass],
      ['order', next.order],
      ['family', next.family],
      ['genus', next.genus],
      ['subgenus', next.subgenus],
      ['species', next.species],
      ['subspecies', next.subspecies],
      ['uninomial', next.uninomial],
      ['infraspecific_epithet', next.infraspecificEpithet],
      ['specific_epithet', next.specificEpithet],
      ['accepted_name', next.acceptedName],
      ['review_reason', next.reviewReason],
      ['taxon_rank', next.taxonRank],
      ['conservation_code', next.conservationCode],
      ['authority', next.authority],
      ['conservation_code_active', next.conservationCodeActive],
      ['publication_status', next.publicationStatus],
      ['review', next.review],
      ['is_current', next.isCurrent],
      ['is_wa_recognised', next.waCensus],
      ['validated', next.validated],
      ['is_autonym', next.isAutonym],
      ['deleted', next.deleted],
    ] as const).forEach(([key, value]) => {
      if (typeof value !== 'string') {
        return;
      }
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (next.resetPage || typeof next.q === 'string' || typeof next.author === 'string' || typeof next.publicationStatus === 'string' || typeof next.review === 'string' || typeof next.isCurrent === 'string') {
      params.set('page', '1');
    }

    setSearchParams(params);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      q: draftFilters.q.trim(),
      id: draftFilters.id.trim(),
      legacyId: draftFilters.legacyId.trim(),
      scientificName: draftFilters.scientificName.trim(),
      author: draftFilters.author.trim(),
      yearPublished: draftFilters.yearPublished.trim(),
      publicationName: draftFilters.publicationName.trim(),
      volumeInformation: draftFilters.volumeInformation.trim(),
      vernacular: draftFilters.vernacular.trim(),
      division: draftFilters.division.trim(),
      phylum: draftFilters.phylum.trim(),
      taxonClass: draftFilters.taxonClass.trim(),
      order: draftFilters.order.trim(),
      family: draftFilters.family.trim(),
      genus: draftFilters.genus.trim(),
      subgenus: draftFilters.subgenus.trim(),
      species: draftFilters.species.trim(),
      subspecies: draftFilters.subspecies.trim(),
      uninomial: draftFilters.uninomial.trim(),
      infraspecificEpithet: draftFilters.infraspecificEpithet.trim(),
      specificEpithet: draftFilters.specificEpithet.trim(),
      acceptedName: draftFilters.acceptedName.trim(),
      reviewReason: draftFilters.reviewReason.trim(),
      taxonRank: draftFilters.taxonRank,
      conservationCode: draftFilters.conservationCode.trim(),
      authority: draftFilters.authority,
      conservationCodeActive: draftFilters.conservationCodeActive,
      publicationStatus: draftFilters.publicationStatus,
      review: draftFilters.review,
      isCurrent: draftFilters.isCurrent,
      waCensus: draftFilters.waCensus,
      validated: draftFilters.validated,
      isAutonym: draftFilters.isAutonym,
      deleted: draftFilters.deleted,
      resetPage: true,
    });
  };

  const onSort = (column: ColumnKey) => {
    const nextSortField = sortableColumns[column];
    if (!nextSortField) {
      return;
    }

    updateParams({
      sortField: nextSortField,
      sortOrder:
        sortField === nextSortField && sortOrder === 'ASC' ? 'DESC' : 'ASC',
      page: 1,
    });
  };

  const renderCellContent = (column: ColumnKey, record: TaxonNameRecord) => {
    const taxonNameId = getTaxonNameId(record);

    switch (column) {
      case 'id':
        return <span className="text-muted-foreground">{textOrEmpty(taxonNameId)}</span>;
      case 'name':
        return (
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 font-medium">
              <span>{renderName(record)}</span>
              {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
            </div>
            <div className="text-xs text-muted-foreground">NomosID {taxonNameId}</div>
          </div>
        );
      case 'legacyId':
        return <span className="text-muted-foreground">{textOrEmpty(record.legacy_id as string | number | null)}</span>;
      case 'scientificName':
        return textOrEmpty(record.scientific_name);
      case 'canonicalName':
        return textOrEmpty(record.canonical_name);
      case 'rank':
        return typeof record.taxon_rank === 'string'
          ? record.taxon_rank
          : textOrEmpty(record.taxon_rank?.rank_name);
      case 'kingdom':
        return typeof record.kingdom === 'string'
          ? record.kingdom
          : textOrEmpty(record.kingdom?.kingdom_name);
      case 'division':
        return renderHtmlOrFallback(ancestorMaps.Division?.[taxonNameId]);
      case 'phylum':
        return renderHtmlOrFallback(ancestorMaps.Phylum?.[taxonNameId]);
      case 'class':
        return renderHtmlOrFallback(ancestorMaps.Class?.[taxonNameId]);
      case 'order':
        return renderHtmlOrFallback(ancestorMaps.Order?.[taxonNameId]);
      case 'family':
        return renderHtmlOrFallback(ancestorMaps.Family?.[taxonNameId]);
      case 'genus':
        return renderHtmlOrFallback(ancestorMaps.Genus?.[taxonNameId]);
      case 'subgenus':
        return renderHtmlOrFallback(ancestorMaps.Subgenus?.[taxonNameId]);
      case 'species':
        return renderHtmlOrFallback(ancestorMaps.Species?.[taxonNameId]);
      case 'subspecies':
        return renderHtmlOrFallback(ancestorMaps.Subspecies?.[taxonNameId]);
      case 'author':
        return textOrEmpty(record.author);
      case 'yearPublished':
        return <span className="text-muted-foreground">{textOrEmpty(record.form_desc_yr as string | number | null)}</span>;
      case 'monthPublished':
        return <span className="text-muted-foreground">{textOrEmpty(record.form_desc_mn as string | number | null)}</span>;
      case 'dayPublished':
        return <span className="text-muted-foreground">{textOrEmpty(record.form_desc_dy as string | number | null)}</span>;
      case 'publication':
        return (record.publication_id && publicationMap[record.publication_id]) ||
          (record.publication_id ? `Publication ${record.publication_id}` : '');
      case 'volumeInformation':
        return textOrEmpty(record.volume_information);
      case 'status':
        return (
          <div className="flex flex-wrap gap-2">
            {getPublicationStatusLabel(record.publication_status) ? (
              <Badge variant="outline">
                {getPublicationStatusLabel(record.publication_status)}
              </Badge>
            ) : null}
            {record.review ? <Badge variant="secondary">Review</Badge> : null}
            {record.is_current ? <Badge>Current</Badge> : null}
          </div>
        );
      case 'reviewFlag':
        return booleanOrEmpty(record.review);
      case 'waCensusField':
        return booleanOrEmpty(record.is_wa_recognised);
      case 'isAutonym':
        return booleanOrEmpty(record.is_autonym);
      case 'vernaculars':
        return textOrEmpty(record.all_vernaculars);
      case 'vernacular':
        return textOrEmpty(record.vernacular);
      case 'conservationCodes':
        return (
          conservationCodeMap[taxonNameId]?.length ? (
            <div className="flex flex-wrap gap-2">
              {conservationCodeMap[taxonNameId].map((code) => (
                <Badge key={code} variant="outline">
                  {code}
                </Badge>
              ))}
            </div>
          ) : (
            ''
          )
        );
      case 'reviewReason':
        return textOrEmpty(record.review_reason);
      case 'uninomial':
        return textOrEmpty(record.uninomial);
      case 'specificEpithet':
        return textOrEmpty(record.specific_epithet);
      case 'infraspecificEpithet':
        return textOrEmpty(record.infraspecific_epithet);
      case 'origin':
        return textOrEmpty(record.origin);
      case 'comments':
        return textOrEmpty(record.comments);
      case 'contributedBy':
        return textOrEmpty(record.contributed_by);
      case 'contributedOn':
        return <span className="text-muted-foreground">{formatDate(record.contributed_on)}</span>;
      case 'validated':
        return booleanOrEmpty(record.validated);
      case 'source':
        return textOrEmpty(record.source);
      case 'externalId':
        return textOrEmpty(record.external_id);
      case 'familyCode':
        return textOrEmpty(record.family_code);
      case 'editor':
        return textOrEmpty(record.editor);
      case 'naturalisedStatus':
        return textOrEmpty(record.naturalised_status);
      case 'naturalisedCertainty':
        return booleanOrEmpty(record.naturalised_certainty);
      case 'isEradicated':
        return textOrEmpty(record.is_eradicated);
      case 'naturalisedComments':
        return textOrEmpty(record.naturalised_comments);
      case 'linearSequence':
        return <span className="text-muted-foreground">{textOrEmpty(record.linear_sequence as number | null)}</span>;
      case 'authorisedBy':
        return textOrEmpty(record.authorised_by);
      case 'authorisedOn':
        return <span className="text-muted-foreground">{formatDate(record.authorised_on)}</span>;
      case 'createdBy':
        return (record.created_by && userMap[record.created_by]) ||
          (record.created_by ? `User ${record.created_by}` : '');
      case 'created':
        return <span className="text-muted-foreground">{formatDate(record.created_on)}</span>;
      case 'notes':
        return textOrEmpty(record.notes);
      case 'adminComment':
        return textOrEmpty(record.admin_comment);
      case 'updatedBy':
        return (record.updated_by && userMap[record.updated_by]) ||
          (record.updated_by ? `User ${record.updated_by}` : '');
      case 'updated':
        return <span className="text-muted-foreground">{formatDate(record.updated_on)}</span>;
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

  const renderTextFilter = (
    label: string,
    key: keyof TaxonNameFilters,
    placeholder?: string
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        value={draftFilters[key] as string}
        onChange={(event) =>
          setDraftFilters((current) => ({
            ...current,
            [key]: event.target.value,
          }))
        }
        placeholder={placeholder || label}
        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );

  const renderSelectFilter = (
    label: string,
    key: keyof TaxonNameFilters,
    options: Array<{ label: string; value: string }>
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={draftFilters[key] as string}
        onChange={(event) =>
          setDraftFilters((current) => ({
            ...current,
            [key]: event.target.value,
          }))
        }
        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderDeletedOnlyFilter = () => (
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
  );

  const clearAllFilters = () => {
    setDraftFilters({
      q: '',
      id: '',
      legacyId: '',
      scientificName: '',
      author: '',
      yearPublished: '',
      publicationName: '',
      volumeInformation: '',
      vernacular: '',
      division: '',
      phylum: '',
      taxonClass: '',
      order: '',
      family: '',
      genus: '',
      subgenus: '',
      species: '',
      subspecies: '',
      uninomial: '',
      infraspecificEpithet: '',
      specificEpithet: '',
      acceptedName: '',
      reviewReason: '',
      taxonRank: '',
      conservationCode: '',
      authority: '',
      conservationCodeActive: '',
      publicationStatus: '',
      review: '',
      isCurrent: '',
      waCensus: '',
      validated: '',
      isAutonym: '',
      deleted: '',
    });
    setSearchParams(new URLSearchParams());
  };

  const handleExport = async () => {
    if (isExporting || state.total === 0) {
      return;
    }

    try {
      setIsExporting(true);
      const totalPages = Math.max(Math.ceil(state.total / EXPORT_BATCH_SIZE), 1);
      const allRecords: TaxonNameRecord[] = [];

      for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
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
      const userIds = Array.from(
        new Set(
          allRecords
            .flatMap((record) => [record.created_by, record.updated_by])
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
      const [
        exportPublicationMap,
        exportUserMap,
        exportConservationCodeMap,
        ...exportAncestorResults
      ] = await Promise.all([
        fetchReferenceMap('publications', publicationIds, 'publication_id', 'title'),
        fetchReferenceMap('users', userIds, 'user_id', 'full_name'),
        fetchConservationCodeMap(taxonNameIds),
        ...ANCESTOR_RESOURCES.map((resource) => fetchAncestorMap(resource, taxonNameIds)),
      ]);

      const exportAncestorMaps =
        exportAncestorResults.reduce<Partial<Record<AncestorResource, Record<number, string>>>>(
          (acc, result, index) => {
            acc[ANCESTOR_RESOURCES[index]] = result;
            return acc;
          },
          {}
        );

      const csv = buildExportCsv(allRecords, exportColumnOptions, {
        publicationMap: exportPublicationMap,
        userMap: exportUserMap,
        ancestorMaps: exportAncestorMaps,
        conservationCodeMap: exportConservationCodeMap,
      });
      const dateStamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`taxon_names_${dateStamp}.csv`, csv);
    } finally {
      setIsExporting(false);
    }
  };

  const visibleColumnOptions = React.useMemo(
    () =>
      columnOptions.filter((column) =>
        column.key === 'deleted' ? canViewDeleted : true
      ),
    [canViewDeleted]
  );

  const exportColumnOptions = React.useMemo(
    () => visibleColumnOptions.filter((column) => column.key !== 'actions'),
    [visibleColumnOptions]
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Taxon names</h1>
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
            <Button
              type="button"
              variant="outline"
              onClick={clearAllFilters}
            >
              Clear active filters
            </Button>
          ) : null}
          <AuthorizedButtonLink resource="taxon_names" action="create" to="/taxon_names/create" variant="outline">
            <Plus className="h-4 w-4" />
            Create
          </AuthorizedButtonLink>
          <ColumnsButton resource="taxon_names" storeKey={TABLE_STORE_KEY} />
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
                  placeholder="Name, NomosID, publication..."
                  className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {renderTextFilter('NomosID', 'id')}
              {renderTextFilter('LegacyID', 'legacyId')}
            </div>
            {renderTextFilter('Scientific name', 'scientificName')}
            {renderTextFilter('Author', 'author')}
            {renderSelectFilter(
              'Taxon rank',
              'taxonRank',
              [{ label: 'Any rank', value: '' }].concat(
                TaxonRank.map((option) => ({
                  label: option.name,
                  value: option.id,
                }))
              )
            )}
            {renderSelectFilter(
              'Publication status',
              'publicationStatus',
              publicationStatusOptions
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {renderSelectFilter('Review', 'review', booleanOptions)}
              {renderSelectFilter('Current', 'isCurrent', booleanOptions)}
              {renderSelectFilter('WA census', 'waCensus', booleanOptions)}
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
              <div className="flex items-center gap-2">
                {activeFilterBadges.length > 8 ? (
                  <Badge variant="outline">
                    {activeFilterBadges.length - 8} more active
                  </Badge>
                ) : null}
                {showAdvancedFilters ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {showAdvancedFilters ? (
              <div className="space-y-4 border-t border-border px-4 py-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Names
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    {renderTextFilter('Uninomial', 'uninomial')}
                    {renderTextFilter('Specific epithet', 'specificEpithet')}
                    {renderTextFilter('Infraspecific epithet', 'infraspecificEpithet')}
                  </div>
                  {renderTextFilter('Accepted name', 'acceptedName')}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Hierarchy
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    {renderTextFilter('Division', 'division')}
                    {renderTextFilter('Phylum', 'phylum')}
                    {renderTextFilter('Class', 'taxonClass')}
                    {renderTextFilter('Order', 'order')}
                    {renderTextFilter('Family', 'family')}
                    {renderTextFilter('Genus', 'genus')}
                    {renderTextFilter('Subgenus', 'subgenus')}
                    {renderTextFilter('Species', 'species')}
                    {renderTextFilter('Subspecies', 'subspecies')}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Publication
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    {renderTextFilter('Year published', 'yearPublished')}
                    {renderTextFilter('Publication name', 'publicationName')}
                    {renderTextFilter('Volume information', 'volumeInformation')}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Conservation
                  </p>
                  {renderTextFilter('Conservation code', 'conservationCode')}
                  {renderSelectFilter(
                    'Authority',
                    'authority',
                    [{ label: 'Any authority', value: '' }].concat(
                      ConservationType.map((option) => ({
                        label: option.name,
                        value: option.id,
                      }))
                    )
                  )}
                  {renderSelectFilter(
                    'Conservation code active',
                    'conservationCodeActive',
                    booleanOptions
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Flags
                  </p>
                  {renderTextFilter('Vernacular', 'vernacular')}
                  {renderTextFilter('Review reason', 'reviewReason')}
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    {renderSelectFilter('Validated', 'validated', booleanOptions)}
                    {renderSelectFilter('Autonym', 'isAutonym', booleanOptions)}
                    {canUseDeletedFilter ? renderDeletedOnlyFilter() : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Apply filters</Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearAllFilters}
            >
              Clear all
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
          resource="taxon_names"
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
          {visibleColumnOptions.map((column) => (
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
                htmlFor="taxon-names-per-page"
                className="text-sm text-muted-foreground"
              >
                Rows
              </label>
              <select
                id="taxon-names-per-page"
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

export default TaxonNamesPage;
