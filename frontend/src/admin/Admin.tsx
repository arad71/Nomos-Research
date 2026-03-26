import React, { FC } from 'react';
import {
  Admin as ReactAdmin,
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
import { AUTH_PROVIDER } from '../config';
import authProvider from '../kit/app/authProvider';
import { myDataProvider } from '../kit/app/dataProvider';
import MyLoginPage from '../views/NewLogin';
import MyLayout from '../MyLayout';
import Dashboard from '../Dashboard';
import BookIcon from '@mui/icons-material/Book';
import { LogoutButton } from '../LogoutButton';
import SafeNotification from '../kit/shared/SafeNotification';

import { TaxonNameCreate } from './Taxon_names/TaxonNameCreate';
import { TaxonNameEdit } from './Taxon_names/TaxonNameEdit';
import { TaxonNameList } from './Taxon_names/TaxonNameList';
import { TaxonNameShow } from './Taxon_names/TaxonNameShow';
import { HierarchyCreate } from './Hierarchies/HierarchyCreate';
import { HierarchyEdit } from './Hierarchies/HierarchyEdit';
import { HierarchyList } from './Hierarchies/HierarchyList';
import { HierarchyShow } from './Hierarchies/HierarchyShow';
const STORE_VERSION = '1';
const STORE_APP_KEY = 'taxman';

interface CacheDataProviderProxyParams {
  dataProvider: DataProvider;
  duration?: number;
}

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
        name="taxon_names"
        list={TaxonNameList}
        show={TaxonNameShow}
        edit={TaxonNameEdit}
        create={TaxonNameCreate}
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
