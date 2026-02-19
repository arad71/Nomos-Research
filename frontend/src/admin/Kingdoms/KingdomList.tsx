import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  NumberField,
  ReferenceField,
  TextField,
  EditButton,
} from 'react-admin';
import { List, IfCanAccess } from '@react-admin/ra-rbac';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';

export const KingdomList: FC = (props) => {
  return (
    <List
      {...props}
      sort={{ field: 'kingdom_name', order: 'DESC' }}
      perPage={100}
      pagination={<DefaultPagination />}
      filters={selectableFilters()}
    >
      <Datagrid bulkActionButtons={useCanBulkDelete()} rowClick="show">
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" label="Description" />
        <ReferenceField source="updated_by" reference="users" link="show">
          <TextField source="full_name" />
        </ReferenceField>
        <DateField source="updated_on" />
        <IfCanAccess resource="kingdoms" action="edit">
          <EditButton />
        </IfCanAccess>
      </Datagrid>
    </List>
  );
};
