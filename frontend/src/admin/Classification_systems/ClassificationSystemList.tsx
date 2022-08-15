import React from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  ReferenceField,
  SelectField,
  TextField,
  BooleanField,
  TopToolbar,
  FilterButton,
  CreateButton,
  ExportButton,
} from 'react-admin';
import ClassificationType from './ClassificationType';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';
import {
  ListProps,
  SelectColumnsButton,
  useSelectedColumns,
} from '@react-admin/ra-preferences';
import ResetPreferenceButton from '../shared/ResetPreferenceButton';
import { ClassificationSystemFilters } from './ClassificationSystemFilters';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { MAX_RESULTS } from '../../config';

const postListColumns = {
  id: <TextField source="id" />,
  class_desc: (
    <TextField source="class_desc" label="Classification Description" />
  ),
  class_type: (
    <SelectField
      source="class_type"
      label="Classification Type"
      choices={ClassificationType}
    />
  ),
  preferred: <BooleanField source="preferred" />,
  sort_order: <TextField source="sort_order" />,
  updated_by: (
    <ReferenceField source="updated_by" reference="users">
      <TextField source="full_name" />
    </ReferenceField>
  ),
  updated_on: <DateField source="updated_on" />,
};

const includeColumns = new Set([
  'class_desc',
  'class_type',
  'created_by',
  'created_on',
  'updated_by',
  'updated_on',
]);
const excludeColumns = Object.keys(postListColumns).filter((name: string) => {
  return !includeColumns.has(name);
});
const CLASS_SYSTEM_PREFERENCE = 'classification_systems.list.columns';

const Actions = () => (
  <TopToolbar>
    <FilterButton />
    <SelectColumnsButton
      preference={CLASS_SYSTEM_PREFERENCE}
      columns={postListColumns}
    />
    <ResetPreferenceButton
      label="Reset"
      preferenceName={CLASS_SYSTEM_PREFERENCE}
      defaultValue={Array.from(includeColumns)}
    />
    <WithPermissions resource="classification_systems" action="create">
      <CreateButton />
    </WithPermissions>
    <WithPermissions resource="classification_systems" action="export">
      <ExportButton maxResults={MAX_RESULTS} />
    </WithPermissions>
  </TopToolbar>
);

export const ClassificationSystemList = (props: ListProps) => {
  const columns = useSelectedColumns({
    preferences: CLASS_SYSTEM_PREFERENCE,
    columns: postListColumns,
    omit: excludeColumns,
  });

  return (
    <List
      {...props}
      sort={{ field: 'class_desc', order: 'ASC' }}
      actions={<Actions />}
      perPage={100}
      filters={ClassificationSystemFilters()}
      pagination={<DefaultPagination />}
      bulkActionButtons={useCanBulkDelete()}
    >
      <Datagrid rowClick="show">
        {columns}
        <WithPermissions resource="classification_systems" action="viewdeleted">
          <BooleanField
            source="deleted"
            TrueIcon={DeleteIcon}
            FalseIcon={VisibilityIcon}
          />
        </WithPermissions>
        <WithPermissions action="edit" resource="classification_systems">
          <EditButton />
        </WithPermissions>
      </Datagrid>
    </List>
  );
};
