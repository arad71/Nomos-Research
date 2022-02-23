// in src/users.js
import React, { FC } from 'react';
import {
  List,
  Datagrid,
  TextField,
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

export const TaxonRankList: FC = (props) => (
  <List {...props} sort={{ field: 'rank_name', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="kingdom_id" />
      <TextField source="rank_name" />
      <TextField source="rank_abbrev" />
      <TextField source="direct_parent_rank_id" />
      <TextField source="required_parent_rank_id" />
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <TextField source="created_on" />
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <TextField source="updated_on" />
      <EditButton />
    </Datagrid>
  </List>
);
