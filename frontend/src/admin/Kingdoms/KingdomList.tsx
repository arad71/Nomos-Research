// in src/users.js
import React, { FC } from 'react';
import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  EmailField,
  EditButton, ReferenceField,
} from 'react-admin';

export const KingdomList: FC = (props) => (
    <List {...props}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
        <ReferenceField label="Updated By" source="userId" reference="users">
          <TextField source="first_name" />
        </ReferenceField>
        <TextField source="updated_on" />
        <EditButton />
      </Datagrid>
    </List>
);
