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
  ReferenceField,
  DateField,
} from 'react-admin';
import { makeStyles } from '@material-ui/core';
import { FilterSidebar } from './FilterSidebar';
import { UserListActions } from './UserListActions';
import { UserPagination } from './UserPagination';

const useStyles = makeStyles({
  content: {
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
      classes={{ content: classes.content }}
      {...props}
    >
      <Datagrid rowClick="show">
        <TextField source="id" />
        <EmailField source="email" className={classes.textFonts} />
        <TextField className={classes.textFonts} source="first_name" />
        <TextField className={classes.textFonts} source="last_name" />
        <ReferenceArrayField
          label="User Roles"
          reference="roles"
          source="role_ids"
          sortBy="user_role___role___name"
        >
          <SingleFieldList>
            <ChipField className={classes.roleFonts} source="name" />
          </SingleFieldList>
        </ReferenceArrayField>
        <BooleanField source="is_active" />
        <ReferenceField source="updated_by" reference="users">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="updated_on" showTime />
        <EditButton className={classes.textFonts} />
      </Datagrid>
    </List>
  );
};
