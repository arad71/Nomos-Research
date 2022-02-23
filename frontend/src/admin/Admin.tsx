import React, { FC, useState, useEffect } from 'react';
import { fetchUtils, Admin as ReactAdmin, Resource } from 'react-admin';
import { BACKEND_URL } from '../config';
import authProvider from './authProvider';
import restDataProvider from 'ra-data-rest-client';
import MyLoginPage from '../views/NewLogin';

import { UserList, UserEdit, UserCreate } from './Users';
import { KingdomList, KingdomEdit, KingdomCreate } from './Kingdoms';
import { ClassificationSystemCreate, ClassificationSystemShow, ClassificationSystemEdit, ClassificationSystemList } from './classification_systems';

const httpClient = (url: any, options: any) => {
  if (!options) {
    options = {};
  }
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json'  });
  }
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);
  return fetchUtils.fetchJson(url, options);
};

const dataProvider = restDataProvider(BACKEND_URL, {'users':'user_id','kingdoms':'kingdom_id','classification_systems':'classification_system_id'}, {}, httpClient);


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
                edit={UserEdit}
                create={UserCreate}
            />
        ) : null,
        permissions === 'admin' ? (
            <Resource
                name="kingdoms"
                list={KingdomList}
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
      ]}
    </ReactAdmin>
  );
};
