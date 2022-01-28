// in src/users.js
import React, { FC } from 'react';
import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  EmailField,
  EditButton,
} from 'react-admin';

export const KingdomList: FC = (props) => (
    <List {...props}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
        <EditButton />
      </Datagrid>
    </List>
);
