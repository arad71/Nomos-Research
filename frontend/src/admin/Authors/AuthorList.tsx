import React, { FC } from 'react';
import {
  BooleanField,
  CreateButton,
  Datagrid,
  DateField,
  EditButton,
  ExportButton,
  FilterButton,
  ReferenceField,
  TextField,
  TopToolbar,
} from 'react-admin';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
  IsSuperAdmin,
} from '../shared';

const Actions = () => (
  <TopToolbar>
    <FilterButton />
    <WithPermissions resource="authors" action="create">
      <CreateButton />
    </WithPermissions>
    <WithPermissions resource="authors" action="export">
      <ExportButton maxResults={100000} />
    </WithPermissions>
  </TopToolbar>
);
const deleted: any = IsSuperAdmin ? <BooleanField source="deleted" /> : null;
export const AuthorList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'abbreviation', order: 'ASC' }}
    filters={selectableFilters()}
    actions={<Actions />}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
  >
    <Datagrid rowClick="show">
      <TextField source="abbreviation" />
      <TextField source="surname" />
      <TextField source="first_names" />
      <TextField source="initials" />
      <TextField source="orc_id" label="ORC ID" />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      {deleted}
      <WithPermissions action="edit" resource="authors">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
