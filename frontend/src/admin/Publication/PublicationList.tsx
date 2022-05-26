import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  ReferenceField,
  TextField,
  BooleanField,
  SearchInput,
  TopToolbar,
  CreateButton,
  ExportButton,
} from 'react-admin';
import { WithPermissions } from '@react-admin/ra-rbac';

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
    sort={{ field: 'publication_name', order: 'ASC' }}
    filters={publicationFilters}
    actions={<Actions />}
  >
    <Datagrid rowClick="show">
      <BooleanField source="bad_publication" />
      <TextField source="title" />
      <TextField source="display_title" />
      <TextField source="publication_year" />
      <TextField source="published" />
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
