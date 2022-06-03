import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
} from 'react-admin';
import AuthorType from './AuthorType';
import { WithPermissions, List } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';

export const CitationList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'taxon_name___scientific_name' }}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
  >
    <Datagrid rowClick="show">
      <ReferenceField
        source="taxon_name_id"
        reference="taxon_names"
        sortBy="taxon_name___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="author_id"
        reference="authors"
        sortBy="author___abbreviation"
      >
        <TextField source="abbreviation" />
      </ReferenceField>
      <SelectField source="author_type" choices={AuthorType} />
      <NumberField source="author_order" />
      <ReferenceField source="created_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <WithPermissions resource="citations" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
