// in src/MyLayout.js
import * as React from 'react';
import { Layout } from 'react-admin';
import MyAppBar from './MyAppBar';
import Menu from './MainMenu';

const MyLayout = (props: any) => (
  <Layout {...props} appBar={MyAppBar} menu={Menu} />
);

export default MyLayout;
