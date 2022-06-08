import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  DateField,
  EditButton,
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
} from 'react-admin';
import CrossRefType from './CrossRefType';
import { WithPermissions, List } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';

export const CrossReferenceList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'old_name___scientific_name' }}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
  >
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
