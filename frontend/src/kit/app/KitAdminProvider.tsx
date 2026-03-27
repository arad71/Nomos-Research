import * as React from 'react';
import { CoreAdminContext, localStorageStore } from 'ra-core';
import { i18nProvider } from '@/lib/i18nProvider';
import authProvider from './authProvider';
import { myDataProvider } from './dataProvider';

const store = localStorageStore('1', 'taxman');

type KitAdminProviderProps = {
  children: React.ReactNode;
};

const KitAdminProvider = ({ children }: KitAdminProviderProps) => (
  <CoreAdminContext
    authProvider={authProvider}
    dataProvider={myDataProvider}
    i18nProvider={i18nProvider}
    store={store}
  >
    {children}
  </CoreAdminContext>
);

export default KitAdminProvider;
