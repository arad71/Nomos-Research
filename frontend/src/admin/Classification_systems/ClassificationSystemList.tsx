// in src/users.js
import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  NumberField,
  ReferenceField,
  TextField,
  BooleanField,
} from 'react-admin';
import FullNameField from '../shared/FullNameField';

export const ClassificationSystemList: FC = (props) => (
  <List {...props} sort={{ field: 'class_desc', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <TextField source="class_desc" />
      <TextField source="class_type" />
      <BooleanField source="preferred" />
      <TextField source="sort_order" />
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <EditButton />
    </Datagrid>
  </List>
);
