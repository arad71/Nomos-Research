import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  ReferenceField,
  RichTextField,
  TextField,
} from 'react-admin';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';
import { HierarchyFilters } from './HierarchyFilters';

export const HierarchyList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'path' }}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
    filters={HierarchyFilters}
  >
    <Datagrid rowClick="show">
      <ReferenceField
        source="taxon_name_id"
        reference="taxon_names"
        sortBy="taxon_name___scientific_name"
        link="show"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="parent_nid"
        label="Parent name"
        reference="taxon_names"
        link="show"
        sortBy="parent___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField
        source="classification_system_id"
        reference="classification_systems"
        sortBy="classification_system___class_desc"
        link="show"
      >
        <TextField source="class_desc" />
      </ReferenceField>
      <ReferenceField source="created_by" reference="users" link="show">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="created_on" />
      <ReferenceField source="updated_by" reference="users" link="show">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <WithPermissions resource="hierarchies" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
