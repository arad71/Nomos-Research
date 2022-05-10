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
import { FilterSidebar } from './FilterSidebar';
import { UserListActions } from './UserListActions';

export const UserList: FC = (props) => {
  return (
    <List aside={<FilterSidebar />} actions={<UserListActions />} {...props}>
      <Datagrid rowClick="show">
        <TextField source="id" />
        <EmailField source="email" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <ReferenceArrayField
          label="User Roles"
          reference="roles"
          source="role_ids"
        >
          <SingleFieldList>
            <ChipField source="name" />
          </SingleFieldList>
        </ReferenceArrayField>
        {/*<ArrayField source="user_role">*/}
        {/*<ArrayField source="role">*/}
        {/*<ReferenceArrayField*/}
        {/*  label="User Roles"*/}
        {/*  source="user_role"*/}
        {/*  reference="users"*/}
        {/*>*/}
        {/*  <SingleFieldList>*/}
        {/*    <ChipField source="role_id" />*/}
        {/*  </SingleFieldList>*/}
        {/*</ReferenceArrayField>*/}
        {/*</ArrayField>*/}
        {/*</ArrayField>*/}
        {/*<ReferenceManyField*/}
        {/*  label="User Roles"*/}
        {/*  target="user_id"*/}
        {/*  reference="user_roles"*/}
        {/*>*/}
        {/*  <ReferenceManyField label="" target="role_id" reference="roles">*/}
        {/* eslint-disable-next-line max-len */}
        {/*    <ReferenceManyField label="" target="user_role" reference="users">*/}
        {/*      <SingleFieldList>*/}
        {/*        <ChipField source="role_id" />*/}
        {/*      </SingleFieldList>*/}
        {/*    </ReferenceManyField>*/}
        {/*  </ReferenceManyField>*/}
        {/*</ReferenceManyField>*/}
        <BooleanField source="is_active" />
        <EditButton />
      </Datagrid>
    </List>
  );
};
