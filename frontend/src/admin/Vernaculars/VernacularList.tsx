// in src/users.js
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
import LanguageType from './LanguageType';

export const VernacularList: FC = (props) => (
  <List {...props} sort={{ field: 'taxon_name___scientific_name' }}>
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <ReferenceField
        source="taxon_name_id"
        reference="taxon_names"
        sortBy="taxon_name___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <TextField source="vernacular" />
      <SelectField source="language" choices={LanguageType} />
      <BooleanField source="lang_pref" />
      <BooleanField source="preferred" />
      <TextField source="source" />
      <BooleanField source="enabled" />
      <NumberField source="sort_order" />
      <ReferenceField source="created_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <EditButton />
    </Datagrid>
  </List>
);
