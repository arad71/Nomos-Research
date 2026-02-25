// in src/MyLayout.js
import * as React from 'react';
import { Layout, Loading, useAuthState } from 'react-admin';
import MyAppBar from './MyAppBar';
import Menu from './Menu';

const MyLayout = (props: any) => {
  const { loading, authenticated } = useAuthState();
  if (loading || !authenticated) {
    return <Loading />;
  }
  return <Layout {...props} appBar={MyAppBar} menu={Menu} />;
};

export default MyLayout;
