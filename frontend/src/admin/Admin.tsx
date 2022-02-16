import React, { FC, useState, useEffect } from 'react';
import { fetchUtils, Admin as ReactAdmin, Resource } from 'react-admin';
import authProvider from './authProvider';
import dataProvider from './dataProvider';
import MyLoginPage from '../views/NewLogin';

import { UserList, UserEdit, UserCreate } from './Users';
import { KingdomList, KingdomEdit, KingdomCreate } from './Kingdoms';


export const Admin: FC = () => {

  return (
    <ReactAdmin loginPage={MyLoginPage} dataProvider={dataProvider} authProvider={authProvider}>
      {(permissions: 'admin' | 'user') => [
        permissions === 'admin' ? (
            <Resource
                name="users"
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
      ]}
    </ReactAdmin>
  );
};
