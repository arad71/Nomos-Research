import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  List,
  NumberField,
  ReferenceField,
  TextField,
  EditButton,
} from 'react-admin';
import { WithPermissions } from '@react-admin/ra-rbac';

export const KingdomList: FC = (props) => {
  return (
    <List {...props} sort={{ field: 'kingdom_name', order: 'DESC' }}>
      <Datagrid rowClick="show">
        <NumberField source="id" />
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
        <ReferenceField source="created_by" reference="users">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="created_on" showTime />
        <ReferenceField source="updated_by" reference="users">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="updated_on" showTime />
        <WithPermissions resource="kingdoms" action="edit">
          <EditButton />
        </WithPermissions>
      </Datagrid>
    </List>
  );
};
