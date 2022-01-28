import React, { FC, useState, useEffect } from 'react';
import { fetchUtils, Admin as ReactAdmin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import authProvider from './authProvider';

import { BACKEND_URL } from '../config';
import { UserList, UserEdit, UserCreate } from './Users';
import { KingdomList, KingdomEdit, KingdomCreate } from './Kingdoms';

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

const dataProvider = simpleRestProvider(BACKEND_URL, httpClient);

export const Admin: FC = () => {

  console.log(dataProvider)
  return (
    <ReactAdmin dataProvider={dataProvider} authProvider={authProvider}>
        <Resource
        name="users"
        list={UserList}
        edit={UserEdit}
        create={UserCreate}
      />
        <Resource
        name="kingdoms"
        list={KingdomList}
        edit={KingdomEdit}
        create={KingdomCreate}
      />
    </ReactAdmin>
  );
};
