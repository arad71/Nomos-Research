import React, { FC } from 'react';
import {
  BooleanField,
  CreateButton,
  Datagrid,
  DateField,
  EditButton,
  ExportButton,
  ReferenceField,
  TextField,
  TopToolbar,
} from 'react-admin';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';

export const PublicationList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'title', order: 'ASC' }}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
    filters={selectableFilters}
  >
    <Datagrid rowClick="show">
      <TextField source="title" />
      <TextField source="author_name" />
      <TextField source="publication_year" />
      <TextField source="published" />
      <TextField source="display_title" />
      <BooleanField source="bad_publication" />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <WithPermissions resource="publications" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
