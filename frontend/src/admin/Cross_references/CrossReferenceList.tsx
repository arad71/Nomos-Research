// in src/users.js
import React, { FC } from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  ReferenceField,
  useRecordContext, ReferenceInput, required, SelectInput, TextInput,
} from 'react-admin';
import CrossRefType from "./CrossRefType";
import BooleanOptions from "../shared/BooleanOptions";

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
      <ReferenceField
          source="old_name_id"
          reference="taxon_names"
      >
        <TextField source="rank_name" />
      </ReferenceField>
      <ReferenceField
          source="new_name_id"
          reference="taxon_names"
      >
        <TextField source="rank_name" />
      </ReferenceField>
      <TextField source="cross_reference_type" />
      <TextField source="active" />
      <TextField source="authorised_by" />
      <TextField multiline source="comments" />
      <TextField multiline source="notes" />
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime/>
      <EditButton />
    </Datagrid>
  </List>
);
