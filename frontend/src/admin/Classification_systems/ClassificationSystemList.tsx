import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  NumberField,
  ReferenceField,
  SelectField,
  TextField,
  BooleanField,
} from 'react-admin';
import ClassificationType from './ClassificationType';
import { List, WithPermissions } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';

export const ClassificationSystemList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'class_desc', order: 'DESC' }}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
  >
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <TextField source="class_desc" />
      <SelectField source="class_type" choices={ClassificationType} />
      <BooleanField source="preferred" />
      <TextField source="sort_order" />
      <ReferenceField source="created_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <WithPermissions action="edit" resource="classification_systems">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
