// in src/MyLayout.js
import * as React from 'react';
import { Layout, Loading, useAuthState } from 'react-admin';
import { AppLocationContext } from '@react-admin/ra-navigation';
import MyAppBar from './MyAppBar';
import Menu from './Menu';

const MyLayout = (props: any) => {
  const { loading, authenticated } = useAuthState();
  if (loading || !authenticated) {
    return <Loading />;
  }
  return (
    <AppLocationContext>
      <Layout {...props} appBar={MyAppBar} menu={Menu} />
    </AppLocationContext>
  );
};

export default MyLayout;
