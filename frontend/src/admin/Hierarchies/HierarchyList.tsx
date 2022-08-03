import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  DateField,
  EditButton,
  NumberField,
  ReferenceField,
  RichTextField,
  TextField,
} from 'react-admin';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';

export const HierarchyList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'parent___scientific_name' }}
    perPage={100}
    pagination={<DefaultPagination />}
    filters={selectableFilters()}
    bulkActionButtons={useCanBulkDelete()}
  >
    <Datagrid rowClick="show">
      <ReferenceField
        source="taxon_name_id"
        reference="taxon_names"
        sortBy="taxon_name___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="classification_system_id"
        reference="classification_systems"
        sortBy="classification_system___class_desc"
      >
        <TextField source="class_desc" />
      </ReferenceField>
      <ReferenceField
        source="parent_nid"
        reference="taxon_names"
        sortBy="parent___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField source="created_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="created_on" />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <WithPermissions resource="hierarchies" action="harddelete">
        <BooleanField source="deleted" />
      </WithPermissions>
      <WithPermissions resource="hierarchies" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
