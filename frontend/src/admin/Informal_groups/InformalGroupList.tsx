import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  ReferenceField,
  RichTextField,
  TextField,
  BooleanField,
  TopToolbar,
  FilterButton,
  CreateButton,
} from 'react-admin';
import { List, IfCanAccess } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';
import {
  ListProps,
  SelectColumnsButton,
  useSelectedColumns,
} from '@react-admin/ra-preferences';
import ResetPreferenceButton from '../shared/ResetPreferenceButton';

import { InformalGroupFilters } from './InformalGroupFilters';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BatchExportButton from '../shared/BatchExportButton';

const postListColumns = {
  id: <TextField source="id" />,
  class_desc: (
    <ReferenceField
      source="classification_system_id"
      reference="classification_systems"
      label="Classification system"
      sortBy="classification_system___class_desc"
      link="show"
    >
      <TextField source="class_desc" />
    </ReferenceField>
  ),
  formatted_scientific_name: (
    <ReferenceField
      source="taxon_name_id"
      reference="taxon_names"
      sortBy="taxon_name___scientific_name"
      link="show"
    >
      <RichTextField source="formatted_scientific_name" />
    </ReferenceField>
  ),

  class_type: (
    <ReferenceField
      source="classification_system_id"
      reference="classification_systems"
      label="Classification"
      sortBy="classification_system___class_type"
      link="show"
    >
      <TextField source="class_type" />
    </ReferenceField>
  ),
  updated_by: (
    <ReferenceField source="updated_by" reference="users" link="show">
      <TextField source="full_name" />
    </ReferenceField>
  ),
  updated_on: <DateField source="updated_on" />,
};

const includeColumns = new Set([
  'class_desc',
  'formatted_scientific_name',
  'updated_by',
  'updated_on',
]);
const excludeColumns = Object.keys(postListColumns).filter((name: string) => {
  return !includeColumns.has(name);
});
const INFORMAL_GROUP_PREFERENCE = 'informal_group.list.columns';

const Actions = () => (
  <TopToolbar>
    <FilterButton />
    <SelectColumnsButton
      preference={INFORMAL_GROUP_PREFERENCE}
      columns={postListColumns}
    />
    <ResetPreferenceButton
      label="Reset"
      preferenceName={INFORMAL_GROUP_PREFERENCE}
      defaultValue={Array.from(includeColumns)}
    />
    <IfCanAccess resource="informal_group" action="create">
      <CreateButton />
    </IfCanAccess>
    <IfCanAccess resource="informal_group" action="export">
      <BatchExportButton />
    </IfCanAccess>
  </TopToolbar>
);

export const InformalGroupList = (props: ListProps) => {
  const columns = useSelectedColumns({
    preferences: INFORMAL_GROUP_PREFERENCE,
    columns: postListColumns,
    omit: excludeColumns,
  });

  return (
    <List
      {...props}
      sort={{ field: 'updated_on', order: 'DESC' }}
      actions={<Actions />}
      perPage={100}
      filters={InformalGroupFilters()}
      pagination={<DefaultPagination />}
    >
      <Datagrid bulkActionButtons={useCanBulkDelete()} rowClick="show">
        {columns}

        <IfCanAccess resource="informal_groups" action="viewdeleted">
          <BooleanField
            source="deleted"
            TrueIcon={DeleteIcon}
            FalseIcon={VisibilityIcon}
          />
        </IfCanAccess>
        <IfCanAccess resource="informal_groups" action="edit">
          <EditButton />
        </IfCanAccess>
      </Datagrid>
    </List>
  );
};
