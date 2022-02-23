// in src/users.js
import React, { FC } from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  ReferenceField,
  useRecordContext, TextInput,
} from 'react-admin';

const FullNameField = (props) => {
  const record = useRecordContext(props);

  return <span>{record.first_name} {record.last_name}</span>;
};

FullNameField.defaultProps = { label: 'Name' };

export const AuthorList: FC = (props) => (
    <List {...props} sort={{ field: 'class_desc', order: 'DESC' }}>
      <Datagrid rowClick="show">
        <TextField source="id" />
        <TextField source="author" />
        <TextField source="surname" />
        <TextField source="first_names"/>
        <TextField source="initials"/>
        <TextField source="orc_id" />
        <ReferenceField source="created_by" reference="users">
          <FullNameField source="last_name" />
        </ReferenceField>
        <TextField source="created_on" />
        <ReferenceField source="updated_by" reference="users">
          <FullNameField source="last_name" />
        </ReferenceField>
        <TextField source="updated_on" />
        <EditButton />
      </Datagrid>
    </List>
);
