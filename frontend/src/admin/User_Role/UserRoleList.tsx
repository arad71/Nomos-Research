// in src/users.js
import React, { FC } from 'react';
import { Datagrid, List, ReferenceField, TextField } from 'react-admin';

export const UserRoleList: FC = (props) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="user_id" />
      <TextField source="role_id" />
      <ReferenceField label="Roles" source="role" reference="user_roles">
        <TextField source="name" />
      </ReferenceField>
    </Datagrid>
  </List>
);
