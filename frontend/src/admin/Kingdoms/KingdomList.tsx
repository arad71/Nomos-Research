// in src/users.js
import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  List,
  NumberField,
  ReferenceField,
  TextField,
} from 'react-admin';
import MyEditButton from '../styles/EditButton';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  table: {
    backgroundColor: 'White',
  },
  rowCell: {
    border: '1px solid lightgrey',
  },
  headerCell: {
    backgroundColor: 'White',
    border: '1px solid lightgrey',
    borderBottom: '2px solid black',
    fontWeight: 'bold',
  },
});

export const KingdomList: FC = (props) => {
  const classes = useStyles();
  return (
    <List {...props} sort={{ field: 'kingdom_name', order: 'DESC' }}>
      <Datagrid classes={classes} rowClick="show">
        <NumberField source="id" />
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
        <ReferenceField source="created_by" reference="users">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="created_on" showTime />
        <ReferenceField source="updated_by" reference="users">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="updated_on" showTime />
        <MyEditButton />
      </Datagrid>
    </List>
  );
};
