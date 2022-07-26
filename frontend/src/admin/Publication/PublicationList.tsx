import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  DateField,
  EditButton,
  ReferenceField,
  TextField,
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
    sort={{ field: 'display_title', order: 'ASC' }}
    filters={publicationFilters}
    actions={<Actions />}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
    filters={selectableFilters()}
  >
    <Datagrid rowClick="show">
      <TextField source="display_title" />
      <TextField source="author_name" />
      <TextField source="publication_year" />
      <TextField source="published" />
      <TextField source="display_title" />
      <BooleanField
        source="published"
        //Is here while a decision is made on how to deal with blank values.
        looseValue
      />
      <TextField source="abbreviated_title" />
      <TextField source="title" />
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
