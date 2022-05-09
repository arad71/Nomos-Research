// in src/users.js
import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  EditButton,
  EmailField,
  List,
  TextField,
} from 'react-admin';
import { FilterSidebar } from './FilterSidebar';
import { ReferenceField } from 'react-admin';
import { ArrayField } from 'react-admin';

export const UserList: FC = (props) => (
  <List aside={<FilterSidebar />} {...props}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <EmailField source="email" />
      <TextField source="first_name" />
      <TextField source="last_name" />
      <TextField source="last_name" />
      <ArrayField source="user_role">
        <ReferenceField source="role_id" reference="roles">
          <TextField source="name" />
        </ReferenceField>
      </ArrayField>
      <BooleanField source="is_active" />
      <EditButton />
    </Datagrid>
  </List>
);
