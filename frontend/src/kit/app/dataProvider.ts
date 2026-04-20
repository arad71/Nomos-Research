import { fetchUtils } from 'react-admin';
import type {
  DataProvider,
  GetListParams,
  GetManyParams,
  GetManyReferenceParams,
  GetOneParams,
} from 'ra-core';
import simpleRestProvider from 'ra-data-simple-rest';
import { BACKEND_URL } from '../../config';
import type { InfragenericData } from '../taxon-names/infrageneric/TaxonTypes';

const httpClient = (url: any, options?: any) => {
  if (!options) {
    options = {};
  }
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);

  const normalizeApiError = (detail: any): string => {
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === 'string') {
            return item;
          }
          if (item && typeof item === 'object' && typeof item.msg === 'string') {
            return item.msg;
          }
          return JSON.stringify(item);
        })
        .join('\n');
    }
    if (detail && typeof detail === 'object') {
      if (typeof detail.msg === 'string') {
        return detail.msg;
      }
      return JSON.stringify(detail);
    }
    return 'Request failed';
  };

  return fetchUtils.fetchJson(url, options).catch((error: any) => {
    return new Promise((resolve, reject) => {
      const detail = error?.body?.detail;
      reject({ message: normalizeApiError(detail), status: error?.status });
    });
  });
};

const resourceIdMap: Record<string, string> = {
  users: 'user_id',
  kingdoms: 'kingdom_id',
  classification_systems: 'classification_system_id',
  authors: 'author_id',
  taxon_ranks: 'taxon_rank_id',
  publications: 'publication_id',
  citations: 'citation_id',
  taxon_names: 'taxon_name_id',
  taxon_name_parents: 'taxon_name_parent_id',
  taxon_name_parent_reviews: 'taxon_name_parent_review_id',
  taxon_names_code: 'taxon_name_id',
  taxon_names_parallel_name_preview: 'taxon_name_id',
  informal_groups: 'informal_group_id',
  hierarchies: 'hierarchy_id',
  'hierarchies/parents': 'taxon_name_id',
  cross_references: 'cross_reference_id',
  vernaculars: 'vernacular_id',
  user_roles: 'user_role_id',
  roles: 'role_id',
  taxon_names_infrageneric_names: 'taxon_name_id',
  conservation_codes: 'conservation_code_id',
  conscode_taxons: 'conscode_taxon_id',
};

const toRaRecord = (resource: string, record: any) => {
  if (!record || typeof record !== 'object') {
    return record;
  }
  const idKey = resourceIdMap[resource];
  let nextRecord = record;
  if (resource === 'taxon_names') {
    nextRecord = {
      parallel_override_uninomial: null,
      parallel_override_specific_epithet: null,
      parallel_override_infraspecific_epithet: null,
      ...nextRecord,
    };
  }
  if (!idKey || nextRecord.id !== undefined || nextRecord[idKey] === undefined) {
    return nextRecord;
  }
  return { ...nextRecord, id: nextRecord[idKey] };
};

const remapParamsForResource = (resource: string, params: any) => {
  const idKey = resourceIdMap[resource] || 'id';
  if (!params || idKey === 'id') {
    return params;
  }

  const nextParams = { ...params };

  if (
    resource === 'taxon_names' &&
    nextParams.filter?.q &&
    !nextParams.filter?.id &&
    /^\d+$/.test(String(nextParams.filter.q).trim())
  ) {
    const qValue = String(nextParams.filter.q).trim();
    const { q, ...restFilter } = nextParams.filter;
    nextParams.filter = { ...restFilter, id: qValue };
  }

  if (nextParams.sort?.field === 'id') {
    nextParams.sort = { ...nextParams.sort, field: idKey };
  }

  if (nextParams.filter && Object.prototype.hasOwnProperty.call(nextParams.filter, 'id')) {
    const { id, ...restFilter } = nextParams.filter;
    nextParams.filter = { ...restFilter, [idKey]: id };
  }

  if (Array.isArray(nextParams.ids)) {
    nextParams.ids = nextParams.ids.map((id) => Number(id));
  }

  if (nextParams.target === 'id') {
    nextParams.target = idKey;
  }

  return nextParams;
};

const normalizeResponseData = (resource: string, data: any) => {
  if (Array.isArray(data)) {
    return data.map((record) => toRaRecord(resource, record));
  }
  return toRaRecord(resource, data);
};

const baseDataProvider = simpleRestProvider(BACKEND_URL, httpClient);

const dataProvider: DataProvider = new Proxy(baseDataProvider, {
  get: (target, name: string | symbol) => {
    const proxyTarget: any = target;
    if (typeof name === 'symbol') {
      return proxyTarget[name];
    }

    const method = proxyTarget[name];
    if (typeof method !== 'function') {
      return method;
    }

    return async (resource: string, params: any) => {
      const mappedParams = remapParamsForResource(resource, params);
      const response = await method(resource, mappedParams);
      if (!response || response.data === undefined) {
        return response;
      }
      return {
        ...response,
        data: normalizeResponseData(resource, response.data),
      };
    };
  },
});

export const myDataProvider: DataProvider = {
  ...dataProvider,
  getOne: (resource: string, params: GetOneParams) => {
    if (resource === 'taxon_names_infrageneric_names') {
      const url = `${BACKEND_URL}/${resource}/${params.id}`;
      return httpClient(url).then(({ json }: { json: [InfragenericData] }) => ({
        data: { id: params.id, infrageneric_names: json },
      }));
    }
    if (resource === 'taxon_names_parallel_name_preview') {
      const strict = params?.meta && typeof params.meta === 'object' && 'strict' in params.meta
        ? Boolean((params.meta as { strict?: boolean }).strict)
        : false;
      const url = `${BACKEND_URL}/taxon_names_parallel_name_preview/${params.id}${strict ? '?strict=true' : ''}`;
      return httpClient(url).then(({ json }: { json: Record<string, unknown> }) => ({
        data: { id: params.id, ...(json ?? {}) },
      }));
    }
    if (resource === 'taxon_names_code') {
      resource = 'taxon_names';
    }
    return dataProvider.getOne(resource, params);
  },
  update: async (resource: string, params: UpdateParams) => {
    const resolvedResource = resource === 'taxon_names_code' ? 'taxon_names' : resource;
    const response = await dataProvider.update(
      resolvedResource,
      remapParamsForResource(resolvedResource, params)
    );

    const recordId =
      response?.data?.id ??
      (params.id != null ? params.id : undefined);

    if (recordId == null) {
      return response;
    }

    const freshRecord = await dataProvider.getOne(resolvedResource, { id: recordId });

    return {
      ...freshRecord,
      data: {
        ...(params.previousData ?? {}),
        ...(freshRecord?.data ?? {}),
        ...(params.data ?? {}),
        id: freshRecord?.data?.id ?? recordId,
      },
    };
  },
  getList: (resource: string, params: GetListParams) => {
    if (resource === 'taxon_names_code') {
      resource = 'taxon_names';
    }
    return dataProvider.getList(resource, remapParamsForResource(resource, params));
  },
  getMany: (resource: string, params: GetManyParams) => {
    if (resource === 'taxon_names_code') {
      resource = 'taxon_names';
    }
    if (resource === 'roles') {
      return Promise.all(
        params.ids.map((id) => dataProvider.getOne(resource, { id })),
      ).then((responses) => ({
        data: responses.map((response) => response.data),
      }));
    }
    const idKey = resourceIdMap[resource] || 'id';
    if (idKey === 'id') {
      return dataProvider.getMany(resource, params);
    }
    const listParams: any = {
      pagination: { page: 1, perPage: Math.max(params.ids.length, 1) },
      sort: { field: idKey, order: 'ASC' },
      filter: { [idKey]: params.ids },
    };
    return dataProvider.getList(resource, listParams).then((response: any) => ({ data: response.data }));
  },
  getManyReference: (resource: string, params: GetManyReferenceParams) => {
    if (resource === 'taxon_names_code') {
      resource = 'taxon_names';
    }
    return dataProvider.getManyReference(resource, remapParamsForResource(resource, params));
  },
};
