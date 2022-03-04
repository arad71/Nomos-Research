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

export const HierarchyList: FC = (props) => (
  <List {...props} sort={{ field: 'class_desc', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <ReferenceField source="taxon_name_id" reference="taxon_names">
        <TextField source="scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="classification_system_id"
        reference="classification_systems"
      >
        <TextField source="class_desc" />
      </ReferenceField>
      <ReferenceField source="parent_nid" reference="taxon_names">
        <TextField source="scientific_name" />
      </ReferenceField>
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
