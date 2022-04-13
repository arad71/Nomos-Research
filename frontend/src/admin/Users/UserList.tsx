// in src/users.js
import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  EditButton,
  EmailField,
  List,
  TextField,
} from 'react-admin';

export const UserList: FC = (props) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <EmailField source="email" />
      <TextField source="first_name" />
      <TextField source="last_name" />
      <BooleanField source="is_active" />
      <EditButton />
    </Datagrid>
  </List>
);
