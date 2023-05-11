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
} from '../shared';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { MAX_RESULTS } from '../../config';

const Actions = () => (
  <TopToolbar>
    <FilterButton />
    <WithPermissions resource="publications" action="create">
      <CreateButton />
    </WithPermissions>
    <WithPermissions resource="publications" action="export">
      <ExportButton maxResults={MAX_RESULTS} />
    </WithPermissions>
  </TopToolbar>
);

export const PublicationList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'display_title', order: 'ASC' }}
    actions={<Actions />}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
    filters={selectableFilters()}
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
      <ReferenceField source="updated_by" reference="users" link="show">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <WithPermissions resource="publications" action="viewdeleted">
        <BooleanField
          source="deleted"
          TrueIcon={DeleteIcon}
          FalseIcon={VisibilityIcon}
        />
      </WithPermissions>
      <WithPermissions resource="publications" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
