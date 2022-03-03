// in src/users.js
import React, { FC } from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  ReferenceField,
  useRecordContext,
} from 'react-admin';

const FullNameField = (props: any) => {
  const record = useRecordContext(props);

  return (
    <span>
      {record.first_name} {record.last_name}
    </span>
  );
};

FullNameField.defaultProps = { label: 'Name' };

export const HierarchyList: FC = (props) => (
  <List {...props} sort={{ field: 'class_desc', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <NumberField source="id" />
      <ReferenceField source="taxon_name_id" reference="taxon_names">
        <TextField source="rank_name" />
      </ReferenceField>
      <ReferenceField
        source="classification_system_id"
        reference="classification_systems"
      >
        <TextField source="class_desc" />
      </ReferenceField>
      <ReferenceField source="parent_nid" reference="taxon_names">
        <TextField source="rank_name" />
      </ReferenceField>
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime/>
      <EditButton />
    </Datagrid>
  </List>
);
