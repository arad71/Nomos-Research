import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  NumberField,
  ReferenceField,
  RichTextField,
  TextField,
} from 'react-admin';
import { WithPermissions } from '@react-admin/ra-rbac';

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
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField source="created_by" reference="users" sortBy="">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <WithPermissions resource="informal_groups" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
