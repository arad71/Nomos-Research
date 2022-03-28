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
import CrossRefType from './CrossRefType';

const FullNameField = (props: any) => {
  const record = useRecordContext(props);

  return (
    <span>
      {record.first_name} {record.last_name}
    </span>
  );
};

FullNameField.defaultProps = { label: 'Name' };

export const CrossReferenceList: FC = (props) => (
  <List {...props} sort={{ field: 'class_desc', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <ReferenceField source="old_name_id" reference="taxon_names">
        <TextField source="scientific_name" />
      </ReferenceField>
      <ReferenceField source="new_name_id" reference="taxon_names">
        <TextField source="scientific_name" />
      </ReferenceField>
      <SelectField source="cross_reference_type" choices={CrossRefType} />
      <BooleanField source="active" />
      <TextField source="authorised_by" />
      <TextField source="comments" />
      <TextField source="notes" />
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
