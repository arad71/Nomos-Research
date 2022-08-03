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
import DeleteIcon from '@material-ui/icons/Delete';

export const InformalGroupList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'updated_on', order: 'DESC' }}
    perPage={100}
    pagination={<DefaultPagination />}
    filters={selectableFilters()}
    bulkActionButtons={useCanBulkDelete()}
  >
    <Datagrid rowClick="show">
      <ReferenceField
        source="classification_system_id"
        reference="classification_systems"
        sortBy="classification_system___class_desc"
      >
        <TextField source="class_desc" />
      </ReferenceField>
      <ReferenceField
        source="taxon_name_id"
        reference="taxon_names"
        sortBy="taxon_name___scientific_name"
      >
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <WithPermissions resource="informal_groups" action="harddelete">
        <BooleanField source="deleted" TrueIcon={DeleteIcon} />
      </WithPermissions>
      <WithPermissions resource="informal_groups" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
