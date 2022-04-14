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
  useRecordContext,
  BooleanField,
} from 'react-admin';
import LanguageType from './LanguageType';

const FullNameField = (props: any) => {
  const record = useRecordContext(props);

  return (
    <span>
      {record.first_name} {record.last_name}
    </span>
  );
};

FullNameField.defaultProps = { label: 'Name' };

export const VernacularList: FC = (props) => (
  <List {...props} sort={{ field: 'class_desc', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <TextField source="vernacular" />
      <ReferenceField source="taxon_name_id" reference="taxon_names">
        <TextField source="scientific_name" />
      </ReferenceField>
      <SelectField source="language" choices={LanguageType} />
      <BooleanField source="lang_pref" />
      <BooleanField source="preferred" />
      <TextField source="source" />
      <BooleanField source="enabled" />
      <NumberField source="sort_order" />
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
