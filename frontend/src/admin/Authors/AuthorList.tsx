import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  ReferenceField,
  TextField,
  SearchInput,
} from 'react-admin';
import { WithPermissions } from '@react-admin/ra-rbac';
import { TaxonNameFilters } from '../Taxon_names';

const authorFilters = [<SearchInput source="q" alwaysOn />];

export const AuthorList: FC = (props) => (
  <List {...props} sort={{ field: 'abbreviation' }} filters={authorFilters}>
    <Datagrid rowClick="show">
      <TextField source="abbreviation" />
      <TextField source="surname" />
      <TextField source="first_names" />
      <TextField source="initials" />
      <TextField source="orc_id" />
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
