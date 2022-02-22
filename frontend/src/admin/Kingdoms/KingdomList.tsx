// in src/users.js
import React, { FC } from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  ReferenceField,
  useRecordContext,
} from 'react-admin';

const FullNameField = (props) => {
  const record = useRecordContext(props);

  return <span>{record.first_name} {record.last_name}</span>;
};

FullNameField.defaultProps = { label: 'Name' };

export const KingdomList: FC = (props) => (
    <List {...props} sort={{ field: 'kingdom_name', order: 'DESC' }}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
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
