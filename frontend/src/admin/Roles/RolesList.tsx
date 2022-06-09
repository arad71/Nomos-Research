import React, { FC } from 'react';
import { Datagrid, TextField } from 'react-admin';
import { List } from '@react-admin/ra-rbac';
import { DefaultPagination } from '../shared';

export const RolesList: FC = (props) => (
  <List
    {...props}
    perPage={100}
    bulkActionButtons={false}
    pagination={<DefaultPagination />}
  >
    <Datagrid rowClick="show">
      <TextField source="name" />
      <TextField source="description" />
    </Datagrid>
  </List>
);
