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
import { List, IfCanAccess } from '@react-admin/ra-rbac';
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
    <IfCanAccess resource="authors" action="create">
      <CreateButton />
    </IfCanAccess>
    <IfCanAccess resource="authors" action="export">
      <BatchExportButton />
    </IfCanAccess>
  </TopToolbar>
);

export const AuthorList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'abbreviation', order: 'ASC' }}
    filters={selectableFilters()}
    actions={<Actions />}
    perPage={100}
    pagination={<DefaultPagination />}
  >
    <Datagrid bulkActionButtons={useCanBulkDelete()} rowClick="show">
      <TextField source="abbreviation" />
      <TextField source="surname" />
      <TextField source="first_names" />
      <TextField source="initials" />
      <TextField source="orc_id" label="ORC ID" />
      <ReferenceField source="updated_by" reference="users" link="show">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <IfCanAccess action="viewdeleted" resource="authors">
        <BooleanField
          source="deleted"
          TrueIcon={DeleteIcon}
          FalseIcon={VisibilityIcon}
        />
      </IfCanAccess>
      <IfCanAccess action="edit" resource="authors">
        <EditButton />
      </IfCanAccess>
    </Datagrid>
  </List>
);
