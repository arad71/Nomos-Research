// in src/MyLayout.js
import * as React from 'react';
import { Layout } from 'react-admin';
import { AppLocationContext } from '@react-admin/ra-navigation';
import MyAppBar from './MyAppBar';
import Menu from './Menu';

const MyLayout = (props: any) => (
  <AppLocationContext>
    <Layout {...props} appBar={MyAppBar} menu={Menu} />
  </AppLocationContext>
);

export default MyLayout;
