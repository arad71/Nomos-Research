import React, { FC } from 'react';
import { Datagrid, ReferenceField, TextField } from 'react-admin';
import { DefaultPagination, useCanBulkDelete } from '../shared';
import { List } from '@react-admin/ra-rbac';

export const UserRoleList: FC = (props) => (
  <List {...props} pagination={<DefaultPagination />}>
    <Datagrid bulkActionButtons={useCanBulkDelete()} rowClick="show">
      <TextField source="id" />
      <TextField source="user_id" />
      <TextField source="role_id" />
      <ReferenceField
        label="Roles"
        source="role"
        reference="user_roles"
        link="show"
      >
        <TextField source="name" />
      </ReferenceField>
    </Datagrid>
  </List>
);
