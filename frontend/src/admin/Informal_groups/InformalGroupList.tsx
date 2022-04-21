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
} from 'react-admin';
import FullNameField from '../shared/FullNameField';

export const InformalGroupList: FC = (props) => (
  <List {...props} sort={{ field: 'informal_group_id' }}>
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <ReferenceField
        source="classification_system_id"
        reference="classification_systems"
        sortBy="classification_system___class_desc"
      >
        <TextField source="class_desc" />
      </ReferenceField>
      <ReferenceField
        source="taxon_name_id"
        reference="taxon_names"
        sortBy="taxon_name___scientific_name"
      >
        <TextField source="scientific_name" />
      </ReferenceField>
      <ReferenceField source="created_by" reference="users" sortBy="">
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
