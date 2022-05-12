// in src/users.js
import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  DateField,
  EditButton,
  EmailField,
  List,
  ReferenceField,
  TextField,
} from 'react-admin';
import { FilterSidebar } from './FilterSidebar';
import FullNameField from '../shared/FullNameField';

export const UserList: FC = (props) => (
  <List aside={<FilterSidebar />} {...props}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <EmailField source="email" />
      <TextField source="first_name" />
      <TextField source="last_name" />
      <BooleanField source="is_active" />
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <EditButton />
    </Datagrid>
  </List>
);
