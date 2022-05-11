// in src/users.js
import React, { FC } from 'react';
import {
  BooleanField,
  ChipField,
  Datagrid,
  EditButton,
  EmailField,
  List,
  SingleFieldList,
  TextField,
  ReferenceArrayField,
} from 'react-admin';
import { makeStyles } from '@material-ui/core';
import { FilterSidebar } from './FilterSidebar';
import { UserListActions } from './UserListActions';
import { UserPagination } from './UserPagination';

const useStyles = makeStyles({
  main: {
    fontFamily: 'Helvetica Neue',
  },
  textFonts: {
    fontFamily: 'Helvetica Neue',
    color: '#2C2C2C',
  },
  roleFonts: {
    fontFamily: 'Helvetica Neue',
    color: '#000000',
  },
});

export const UserList: FC = (props) => {
  const classes = useStyles(props);
  return (
    <List
      aside={<FilterSidebar />}
      actions={<UserListActions />}
      pagination={<UserPagination />}
      perPage={100}
      classes={{ main: classes.main }}
      {...props}
    >
      <Datagrid rowClick="show">
        <TextField className={classes.textFonts} source="id" />
        <EmailField source="email" className={classes.textFonts} />
        <TextField className={classes.textFonts} source="first_name" />
        <TextField className={classes.textFonts} source="last_name" />
        <ReferenceArrayField
          label="User Roles"
          reference="roles"
          source="role_ids"
        >
          <SingleFieldList>
            <ChipField className={classes.roleFonts} source="name" />
          </SingleFieldList>
        </ReferenceArrayField>
        <BooleanField source="is_active" />
        <EditButton className={classes.textFonts} />
      </Datagrid>
    </List>
  );
};
