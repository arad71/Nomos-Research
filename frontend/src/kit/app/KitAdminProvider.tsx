import * as React from 'react';
import { CoreAdminContext, localStorageStore } from 'ra-core';
import { QueryClient } from '@tanstack/react-query';
import { i18nProvider } from '@/lib/i18nProvider';
import authProvider from './authProvider';
import { myDataProvider } from './dataProvider';

const store = localStorageStore('1', 'taxman');
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

type KitAdminProviderProps = {
  children: React.ReactNode;
};

const KitAdminProvider = ({ children }: KitAdminProviderProps) => (
  <CoreAdminContext
    authProvider={authProvider}
    dataProvider={myDataProvider}
    i18nProvider={i18nProvider}
    queryClient={queryClient}
    store={store}
  >
    {children}
  </CoreAdminContext>
);

export default KitAdminProvider;
