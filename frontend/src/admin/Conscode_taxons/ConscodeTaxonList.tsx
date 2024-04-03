import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  DateField,
  EditButton,
  ReferenceField,
  RichTextField,
  FunctionField,
  TextField,
  TopToolbar,
  FilterButton,
  CreateButton,
} from 'react-admin';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';
import {
  ListProps,
  SelectColumnsButton,
  useSelectedColumns,
} from '@react-admin/ra-preferences';
import ResetPreferenceButton from '../shared/ResetPreferenceButton';

import { ConservationShort } from '../Conservation_codes/ConservationShort';
import { ConscodeTaxonFilters } from './ConscodeTaxonFilters';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import BatchExportButton from '../shared/BatchExportButton';

const postListColumns = {
  id: <TextField source="id" />,
  formatted_scientific_name: (
    <ReferenceField
      source="taxon_name_id"
      reference="taxon_names"
      sortBy="taxon_name___scientific_name"
      link={(record: any) => `/taxon_names_code/${record.taxon_name_id}/show`}
    >
      <RichTextField source="formatted_scientific_name" />
    </ReferenceField>
  ),
  classification_name: (
    <ReferenceField
      source="conservation_code_id"
      reference="conservation_codes"
      label="Authority"
      sortBy="conservation_code___authorising_org"
      link="show"
    >
      <TextField source="authorising_org" />
    </ReferenceField>
  ),
  conservation_code_value: (
    <ReferenceField
      source="conservation_code_id"
      reference="conservation_codes"
      sortBy="conservation_code___conservation_code_value"
      link="show"
      label="Conservation code"
    >
      <TextField source="conservation_code_value" />
    </ReferenceField>
  ),
  conservation_code_value_double: (
    <ReferenceField
      source="conservation_code_id"
      reference="conservation_codes"
      sortBy="conservation_code___code_priority"
      link={(record: any) => `/taxon_names_code/${record.taxon_name_id}/show`}
      label="Conservation status"
    >
      <ConservationShort source="conservation_code_id" />
    </ReferenceField>
  ),
  code_priority: (
    <ReferenceField
      source="conservation_code_id"
      reference="conservation_codes"
      label="Display order"
      sortBy="conservation_code___code_priority"
      link={(record: any) => `/taxon_names_code/${record.taxon_name_id}/show`}
    >
      <TextField source="code_priority" />
    </ReferenceField>
  ),

  effective_from: <DateField source="effective_from" />,

  effective_to: <DateField source="effective_to" />,
  updated_by: (
    <ReferenceField source="updated_by" reference="users" link="show">
      <TextField source="full_name" />
    </ReferenceField>
  ),
  updated_on: <DateField source="updated_on" />,
};

const includeColumns = new Set([
  'formatted_scientific_name',
  'conservation_code_value_double',
  'code_priority',
  'effective_from',
  'effective_to',
]);

// 'authorising_org',
// 'conservation_code_value',
const excludeColumns = Object.keys(postListColumns).filter((name: string) => {
  return !includeColumns.has(name);
});
const CONSCODE_TAXON_PREFERENCE = 'conscode_taxon.list.columns';

const Actions = () => (
  <TopToolbar>
    <FilterButton />
    <SelectColumnsButton
      preference={CONSCODE_TAXON_PREFERENCE}
      columns={postListColumns}
    />
    <ResetPreferenceButton
      label="Reset"
      preferenceName={CONSCODE_TAXON_PREFERENCE}
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

export const ConscodeTaxonList: FC = (props) => {
  const columns = useSelectedColumns({
    preferences: CONSCODE_TAXON_PREFERENCE,
    columns: postListColumns,
    omit: excludeColumns,
  });
  return (
    <List
      {...props}
      sort={{ field: 'conservation_code___code_priority', order: 'ASC' }}
      actions={<Actions />}
      perPage={100}
      pagination={<DefaultPagination />}
      filters={ConscodeTaxonFilters()}
      bulkActionButtons={useCanBulkDelete()}
    >
      <Datagrid rowClick="show">
        {columns}
        <WithPermissions resource="conscode_taxons" action="viewdeleted">
          <BooleanField
            source="deleted"
            TrueIcon={DeleteIcon}
            FalseIcon={VisibilityIcon}
          />
        </WithPermissions>
        <WithPermissions resource="conscode_taxons" action="edit">
          <EditButton />
        </WithPermissions>
      </Datagrid>
    </List>
  );
};
