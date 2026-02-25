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
import { IfCanAccess, List } from '@react-admin/ra-rbac';
import { FilterSidebar } from './FilterSidebar';
import { UserListActions } from './UserListActions';
import { UserPagination } from './UserPagination';
import { useCanBulkDelete } from '../shared';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const UserList: FC = (props) => {
  return (
    <List
      aside={<FilterSidebar />}
      actions={<UserListActions />}
      pagination={<UserPagination />}
      perPage={100}
      sort={{ field: 'updated_on', order: 'DESC' }}
      {...props}
    >
      <Datagrid bulkActionButtons={useCanBulkDelete()} rowClick="show">
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
        <ReferenceField source="updated_by" reference="users" link="show">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="updated_on" />
        <IfCanAccess resource="users" action="viewdeleted">
          <BooleanField
            source="deleted"
            TrueIcon={DeleteIcon}
            FalseIcon={VisibilityIcon}
          />
        </IfCanAccess>
        <IfCanAccess action="edit" resource="users">
          <EditButton />
        </IfCanAccess>
      </Datagrid>
    </List>
  );
};
