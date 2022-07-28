import React, { FC } from 'react';
import {
  BooleanField,
  ChipField,
  Datagrid,
  EditButton,
  EmailField,
  SingleFieldList,
  TextField,
  ReferenceArrayField,
  ReferenceField,
  DateField,
} from 'react-admin';
import { WithPermissions, List } from '@react-admin/ra-rbac';
import { FilterSidebar } from './FilterSidebar';
import { UserListActions } from './UserListActions';
import { UserPagination } from './UserPagination';
import { useCanBulkDelete } from '../shared';

export const UserList: FC = (props) => {
  return (
    <List
      aside={<FilterSidebar />}
      actions={<UserListActions />}
      pagination={<UserPagination />}
      perPage={100}
      bulkActionButtons={useCanBulkDelete()}
      sort={{ field: 'updated_on', order: 'DESC' }}
      {...props}
    >
      <Datagrid rowClick="show">
        <EmailField source="email" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <ReferenceArrayField
          label="User Roles"
          reference="roles"
          source="role_ids"
          sortBy="user_role___role___name"
        >
          <SingleFieldList>
            <ChipField source="name" />
          </SingleFieldList>
        </ReferenceArrayField>
        <BooleanField source="is_active" />
        <ReferenceField source="updated_by" reference="users">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="updated_on" />
        <WithPermissions action="edit" resource="users">
          <EditButton />
        </WithPermissions>
      </Datagrid>
    </List>
  );
};
