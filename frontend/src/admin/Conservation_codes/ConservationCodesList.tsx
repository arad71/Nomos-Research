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
} from 'react-admin';
import ConservationType from './ConservationType';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';
import {
  ListProps,
  SelectColumnsButton,
  useSelectedColumns,
} from '@react-admin/ra-preferences';
import ResetPreferenceButton from '../shared/ResetPreferenceButton';
import { ConservationCodesFilters } from './ConservationCodesFilters';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import BatchExportButton from '../shared/BatchExportButton';

const postListColumns = {
  id: <TextField source="id" />,
  authorising_org: <TextField source="authorising_org" label="Authority" />,
  conservation_code_value: (
    <TextField source="conservation_code_value" label="Conservation code" />
  ),
  code_priority: <TextField source="code_priority" label="Display order" />,
  updated_by: (
    <ReferenceField source="updated_by" reference="users" link="show">
      <TextField source="full_name" />
    </ReferenceField>
  ),
  updated_on: <DateField source="updated_on" />,
};

const includeColumns = new Set([
  'authorising_org',
  'conservation_code_value',
  'code_priority',
]);
const excludeColumns = Object.keys(postListColumns).filter((name: string) => {
  return !includeColumns.has(name);
});
const CONSERVATION_CODE_PREFERENCE = 'conservation_codes.list.columns';

const Actions = () => (
  <TopToolbar>
    <FilterButton />
    <SelectColumnsButton
      preference={CONSERVATION_CODE_PREFERENCE}
      columns={postListColumns}
    />
    <ResetPreferenceButton
      label="Reset"
      preferenceName={CONSERVATION_CODE_PREFERENCE}
      defaultValue={Array.from(includeColumns)}
    />
    <WithPermissions resource="conservation_codes" action="create">
      <CreateButton />
    </WithPermissions>
    <WithPermissions resource="conservation_codes" action="export">
      <BatchExportButton />
    </WithPermissions>
  </TopToolbar>
);

export const ConservationCodesList = (props: ListProps) => {
  const columns = useSelectedColumns({
    preferences: CONSERVATION_CODE_PREFERENCE,
    columns: postListColumns,
    omit: excludeColumns,
  });

  return (
    <List
      {...props}
      sort={{ field: 'code_priority', order: 'ASC' }}
      actions={<Actions />}
      perPage={100}
      filters={ConservationCodesFilters()}
      pagination={<DefaultPagination />}
      bulkActionButtons={useCanBulkDelete()}
    >
      <Datagrid rowClick="show">
        {columns}
        <WithPermissions resource="conservation_codes" action="viewdeleted">
          <BooleanField
            source="deleted"
            TrueIcon={DeleteIcon}
            FalseIcon={VisibilityIcon}
          />
        </WithPermissions>
        <WithPermissions action="edit" resource="conservation_codes">
          <EditButton />
        </WithPermissions>
      </Datagrid>
    </List>
  );
};
