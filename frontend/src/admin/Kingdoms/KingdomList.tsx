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
    <List {...props} sort={{ field: 'kingdom_name', order: 'DESC' }}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
        <TextField source="updated_by" />
        <TextField source="updated_on" />
        <EditButton />
      </Datagrid>
    </List>
);
