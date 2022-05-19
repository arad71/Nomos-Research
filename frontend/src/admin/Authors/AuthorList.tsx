import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  NumberField,
  ReferenceField,
  TextField,
} from 'react-admin';
import { WithPermissions } from '@react-admin/ra-rbac';

export const AuthorList: FC = (props) => (
  <List {...props} sort={{ field: 'abbreviation' }}>
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <TextField source="abbreviation" />
      <TextField source="surname" />
      <TextField source="first_names" />
      <TextField source="initials" />
      <TextField source="orc_id" />
      <ReferenceField source="created_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <WithPermissions action="edit" resource="authors">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
