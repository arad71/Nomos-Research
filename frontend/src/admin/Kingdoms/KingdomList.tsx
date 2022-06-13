import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  NumberField,
  ReferenceField,
  TextField,
  EditButton,
} from 'react-admin';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';

export const KingdomList: FC = (props) => {
  return (
    <List
      {...props}
      sort={{ field: 'kingdom_name', order: 'DESC' }}
      perPage={100}
      pagination={<DefaultPagination />}
      bulkActionButtons={useCanBulkDelete()}
    >
      <Datagrid rowClick="show">
        <NumberField source="id" />
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
        <ReferenceField source="created_by" reference="users">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="created_on" />
        <ReferenceField source="updated_by" reference="users">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="updated_on" />
        <WithPermissions resource="kingdoms" action="edit">
          <EditButton />
        </WithPermissions>
      </Datagrid>
    </List>
  );
};
