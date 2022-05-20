import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
  BooleanField,
} from 'react-admin';
import CrossRefType from './CrossRefType';
import { WithPermissions } from '@react-admin/ra-rbac';

export const CrossReferenceList: FC = (props) => (
  <List {...props} sort={{ field: 'old_name___scientific_name' }}>
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <ReferenceField
        source="old_name_id"
        reference="taxon_names"
        sortBy="old_name___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="new_name_id"
        reference="taxon_names"
        sortBy="new_name___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <SelectField source="cross_reference_type" choices={CrossRefType} />
      <BooleanField source="active" />
      <TextField source="authorised_by" />
      <TextField source="comments" />
      <TextField source="notes" />
      <ReferenceField source="created_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <WithPermissions resource="cross_references" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
