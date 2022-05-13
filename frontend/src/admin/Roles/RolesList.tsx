// in src/users.js
import React, { FC } from 'react';
import { Datagrid, List, TextField } from 'react-admin';

export const RolesList: FC = (props) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="role_id" />
      <TextField source="name" />
      <TextField source="description" />
    </Datagrid>
  </List>
);
