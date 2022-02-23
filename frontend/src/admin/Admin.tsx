import React, { FC } from 'react';
import { fetchUtils, Admin as ReactAdmin, Resource } from 'react-admin';
import restDataProvider from 'ra-data-rest-client';
import { BACKEND_URL } from '../config';
import authProvider from './authProvider';
import MyLoginPage from '../views/NewLogin';

import { UserList, UserShow, UserEdit, UserCreate } from './Users';
import {
  KingdomList,
  KingdomShow,
  KingdomEdit,
  KingdomCreate,
} from './Kingdoms';
import {
  ClassificationSystemCreate,
  ClassificationSystemShow,
  ClassificationSystemEdit,
  ClassificationSystemList,
} from './Classification_systems';
import { AuthorCreate, AuthorShow, AuthorEdit, AuthorList } from './Authors';
import {
  TaxonRankCreate,
  TaxonRankShow,
  TaxonRankEdit,
  TaxonRankList,
} from './Taxon_rank';

const httpClient = (url: any, options: any) => {
  if (!options) {
    options = {};
  }
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);
  return fetchUtils.fetchJson(url, options);
};

const dataProvider = restDataProvider(
  BACKEND_URL,
  {
  'users':'user_id',
  'kingdoms':'kingdom_id',
  'classification_systems':'classification_system_id',
  'authors':'author_id',
  'taxon_ranks':'taxon_rank_id',
  },
  {},
  httpClient
);

export const Admin: FC = () => {
  return (
    <ReactAdmin
      loginPage={MyLoginPage}
      authProvider={authProvider}
      dataProvider={dataProvider}
    >
      {(permissions: 'admin' | 'user') => [
        permissions === 'admin' ? (
          <Resource
            name="users"
            key="user_id"
            list={UserList}
            show={UserShow}
            edit={UserEdit}
            create={UserCreate}
          />
        ) : null,
        permissions === 'admin' ? (
          <Resource
            name="kingdoms"
            list={KingdomList}
            show={KingdomShow}
            edit={KingdomEdit}
            create={KingdomCreate}
          />
        ) : null,
        permissions === 'admin' ? (
          <Resource
            name="classification_systems"
            list={ClassificationSystemList}
            show={ClassificationSystemShow}
            edit={ClassificationSystemEdit}
            create={ClassificationSystemCreate}
          />
        ) : null,
        permissions === 'admin' ? (
          <Resource
            name="authors"
            list={AuthorList}
            show={AuthorShow}
            edit={AuthorEdit}
            create={AuthorCreate}
          />
        ) : null,
        permissions === 'admin' ? (
          <Resource
            name="taxon_ranks"
            list={TaxonRankList}
            show={TaxonRankShow}
            edit={TaxonRankEdit}
            create={TaxonRankCreate}
          />
        ) : null,
      ]}
    </ReactAdmin>
  );
};
