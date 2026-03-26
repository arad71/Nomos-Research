import React, { FC } from 'react';
import {
  Admin as ReactAdmin,
  fetchUtils,
  localStorageStore,
  Resource,
} from 'react-admin';
import type {
  DataProvider,
  GetListParams,
  GetManyParams,
  GetManyReferenceParams,
  GetOneParams,
} from 'ra-core';
import simpleRestProvider from 'ra-data-simple-rest';
import { AUTH_PROVIDER, BACKEND_URL } from '../config';
import authProvider from '../kit/app/authProvider';
import MyLoginPage from '../views/NewLogin';
import MyLayout from '../MyLayout';
import Dashboard from '../Dashboard';
import BookIcon from '@mui/icons-material/Book';
import { LogoutButton } from '../LogoutButton';
import SafeNotification from './shared/SafeNotification';

import { UserCreate, UserEdit, UserList, UserShow } from './Users';
import { AuthorCreate, AuthorEdit, AuthorList, AuthorShow } from './Authors';
import {
  TaxonNameCreate,
  TaxonNameEdit,
  TaxonNameList,
  TaxonNameShow,
} from './Taxon_names';
import {
  TaxonNameCodeCreate,
  TaxonNameCodeEdit,
  TaxonNameCodeList,
  TaxonNameCodeShow,
} from './Taxon_names_code';
import {
  HierarchyCreate,
  HierarchyEdit,
  HierarchyList,
  HierarchyShow,
} from './Hierarchies';
import { InfragenericData } from './Taxon_names/TaxonTypes';

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
          if (
            item &&
            typeof item === 'object' &&
            typeof item.msg === 'string'
          ) {
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
    return new Promise(function (resolve, reject) {
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
  taxon_names_code: 'taxon_name_id',
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
  if (!idKey || record.id !== undefined || record[idKey] === undefined) {
    return record;
  }
  return { ...record, id: record[idKey] };
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

  if (
    nextParams.filter &&
    Object.prototype.hasOwnProperty.call(nextParams.filter, 'id')
  ) {
    const { id, ...restFilter } = nextParams.filter;
    nextParams.filter = { ...restFilter, [idKey]: id };
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
const STORE_VERSION = '1';
const STORE_APP_KEY = 'taxman';

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
interface CacheDataProviderProxyParams {
  dataProvider: DataProvider;
  duration?: number;
}

export const myDataProvider: DataProvider = {
  ...dataProvider,
  getOne: (resource: string, params: GetOneParams) => {
    if (resource === 'taxon_names_infrageneric_names') {
      const url = `${BACKEND_URL}/${resource}/${params.id}`;
      return httpClient(url).then(({ json }: { json: [InfragenericData] }) => ({
        data: { id: params.id, infrageneric_names: json },
      }));
    }
    if (resource === 'taxon_names_code') {
      resource = 'taxon_names';
    }
    // For other resources, fallback to the default implementation
    return dataProvider.getOne(resource, params);
  },
  getList: (resource: string, params: GetListParams) => {
    if (resource === 'taxon_names_code') {
      resource = 'taxon_names';
    }
    return dataProvider.getList(
      resource,
      remapParamsForResource(resource, params)
    );
  },
  getMany: (resource: string, params: GetManyParams) => {
    if (resource === 'taxon_names_code') {
      resource = 'taxon_names';
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
    return dataProvider
      .getList(resource, listParams)
      .then((response: any) => ({ data: response.data }));
  },
  getManyReference: (resource: string, params: GetManyReferenceParams) => {
    if (resource === 'taxon_names_code') {
      resource = 'taxon_names';
    }
    return dataProvider.getManyReference(
      resource,
      remapParamsForResource(resource, params)
    );
  },
};

// Add cacheing to requests as per https://marmelab.com/react-admin/doc/3.19/Caching.html#application-cache
const cacheDataProviderProxy = ({
  dataProvider,
  // 5 minutes
  duration = 5 * 60 * 1000,
}: CacheDataProviderProxyParams) =>
  new Proxy(dataProvider, {
    get:
      (target, name: string) =>
      (
        resource: string,
        params: GetListParams &
          GetOneParams &
          GetManyParams &
          GetManyReferenceParams
      ) => {
        if (typeof name === 'symbol') {
          return;
        }
        if (
          ['getOne', 'getMany', 'getList', 'getManyReference'].includes(name)
        ) {
          return dataProvider[name](resource, params).then((response: any) => {
            const validUntil = new Date();
            validUntil.setTime(validUntil.getTime() + duration);
            response.validUntil = validUntil;
            return response;
          });
        }
        return dataProvider[name](resource, params);
      },
  });
export const Admin: FC = () => {
  return (
    <ReactAdmin
      loginPage={AUTH_PROVIDER === 'auth2' ? false : MyLoginPage}
      dashboard={Dashboard}
      layout={MyLayout}
      authProvider={authProvider}
      store={localStorageStore(STORE_VERSION, STORE_APP_KEY)}
      dataProvider={cacheDataProviderProxy({ dataProvider: myDataProvider })}
      logoutButton={LogoutButton}
      notification={SafeNotification}
    >
      <Resource
        name="users"
        key="user_id"
        list={UserList}
        show={UserShow}
        edit={UserEdit}
        create={UserCreate}
      />
      <Resource
        name="authors"
        list={AuthorList}
        show={AuthorShow}
        edit={AuthorEdit}
        create={AuthorCreate}
      />
      <Resource
        name="taxon_names"
        list={TaxonNameList}
        show={TaxonNameShow}
        edit={TaxonNameEdit}
        create={TaxonNameCreate}
        icon={BookIcon}
      />
      <Resource
        name="taxon_names_code"
        list={TaxonNameCodeList}
        show={TaxonNameCodeShow}
        edit={TaxonNameCodeEdit}
        create={TaxonNameCodeCreate}
        icon={BookIcon}
      />
      <Resource name="taxon_names_ancestors/Division" />
      <Resource name="taxon_names_ancestors/Phylum" />
      <Resource name="taxon_names_ancestors/Order" />
      <Resource name="taxon_names_ancestors/Class" />
      <Resource name="taxon_names_ancestors/Family" />
      <Resource name="taxon_names_ancestors/Genus" />
      <Resource name="taxon_names_ancestors/Subgenus" />
      <Resource name="taxon_names_ancestors/Species" />
      <Resource name="taxon_names_ancestors/Subspecies" />
      <Resource name="taxon_names_infrageneric_names" />
      <Resource
        name="hierarchies"
        list={HierarchyList}
        show={HierarchyShow}
        edit={HierarchyEdit}
        create={HierarchyCreate}
      />
      <Resource
        name="hierarchies/parents"
        list={HierarchyList}
        show={HierarchyShow}
        edit={HierarchyEdit}
        create={HierarchyCreate}
      />
    </ReactAdmin>
  );
};
