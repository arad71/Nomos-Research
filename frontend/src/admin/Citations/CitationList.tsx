// in src/users.js
import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  NumberField,
  ReferenceField,
  SelectField,
  TextField,
} from 'react-admin';
import AuthorType from './AuthorType';
import FullNameField from '../shared/FullNameField';

export const CitationList: FC = (props) => (
  <List {...props} sort={{ field: 'kingdom_name', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <ReferenceField source="taxon_name_id" reference="taxon_names">
        <TextField source="scientific_name" />
      </ReferenceField>
      <ReferenceField source="author_id" reference="authors">
        <TextField source="author" />
      </ReferenceField>
      <SelectField source="author_type" choices={AuthorType} />
      <NumberField source="author_order" />
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
