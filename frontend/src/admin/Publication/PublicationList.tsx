import React, { FC } from 'react';
import {
  BooleanField,
  CreateButton,
  Datagrid,
  DateField,
  EditButton,
  ExportButton,
  ReferenceField,
  SearchInput,
  TextField,
  TopToolbar,
} from 'react-admin';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';

const publicationFilters = [<SearchInput source="q" alwaysOn />];

const Actions = () => (
  <TopToolbar>
    <WithPermissions resource="publications" action="create">
      <CreateButton />
    </WithPermissions>
    <WithPermissions resource="publications" action="export">
      <ExportButton maxResults={100000} />
    </WithPermissions>
  </TopToolbar>
);

export const PublicationList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'display_title', order: 'ASC' }}
    filters={publicationFilters}
    actions={<Actions />}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
  >
    <Datagrid rowClick="show">
      <TextField source="display_title" />
      <TextField source="author_name" sortable={false} />
      <TextField source="publication_year" />
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
