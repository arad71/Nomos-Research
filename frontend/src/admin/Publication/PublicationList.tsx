import React, { FC } from 'react';
import {
  BooleanField,
  CreateButton,
  Datagrid,
  DateField,
  EditButton,
  FilterButton,
  ReferenceField,
  TextField,
  TopToolbar,
} from 'react-admin';
import { List } from '@react-admin/ra-rbac';
import { CanAccess as IfCanAccess } from 'react-admin';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BatchExportButton from '../shared/BatchExportButton';

const Actions = () => (
  <TopToolbar>
    <FilterButton />
    <IfCanAccess resource="publications" action="create">
      <CreateButton />
    </IfCanAccess>
    <IfCanAccess resource="publications" action="export">
      <BatchExportButton />
    </IfCanAccess>
  </TopToolbar>
);

export const PublicationList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'display_title', order: 'ASC' }}
    actions={<Actions />}
    perPage={100}
    pagination={<DefaultPagination />}
    filters={selectableFilters()}
  >
    <Datagrid bulkActionButtons={useCanBulkDelete()} rowClick="show">
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
      <IfCanAccess resource="publications" action="viewdeleted">
        <BooleanField
          source="deleted"
          TrueIcon={DeleteIcon}
          FalseIcon={VisibilityIcon}
        />
      </IfCanAccess>
      <IfCanAccess resource="publications" action="edit">
        <EditButton />
      </IfCanAccess>
    </Datagrid>
  </List>
);
