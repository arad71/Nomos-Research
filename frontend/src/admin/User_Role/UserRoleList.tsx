import React, { FC } from 'react';
import { Datagrid, ReferenceField, TextField } from 'react-admin';
import { DefaultPagination, useCanBulkDelete } from '../shared';
import { List } from '@react-admin/ra-rbac';

export const UserRoleList: FC = (props) => (
  <List
    {...props}
    bulkActionButtons={useCanBulkDelete()}
    pagination={<DefaultPagination />}
  >
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
