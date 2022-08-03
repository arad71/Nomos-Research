import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  DateField,
  EditButton,
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
} from 'react-admin';
import CrossRefType from './CrossRefType';
import { WithPermissions, List } from '@react-admin/ra-rbac';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';

export const CrossReferenceList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'updated_on', order: 'DESC' }}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
    title="Related names"
    filters={selectableFilters()}
  >
    <Datagrid rowClick="show">
      <ReferenceField
        source="old_name_id"
        reference="taxon_names"
        sortBy="old_name___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="new_name_id"
        reference="taxon_names"
        sortBy="new_name___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <SelectField source="cross_reference_type" choices={CrossRefType} />
      <TextField source="authorised_by" />
      <TextField source="reference_comments" />
      <TextField source="notes" />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <WithPermissions resource="cross_references" action="harddelete">
        <BooleanField source="deleted" />
      </WithPermissions>
      <WithPermissions resource="cross_references" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
