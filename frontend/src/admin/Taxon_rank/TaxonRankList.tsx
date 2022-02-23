// in src/users.js
import React, { FC } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  ReferenceField,
  useRecordContext,
  NumberField,
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
      <ReferenceField source="kingdom_id" reference="kingdoms">
        <TextField source="kingdom_name" />
      </ReferenceField>
      <TextField source="rank_name" />
      <TextField source="rank_abbrev" />
      <ReferenceField
        label="Direct Parent Rank"
        source="direct_parent_rank_id"
        reference="taxon_ranks"
      >
        <NumberField source="rank_name" />
      </ReferenceField>
      <ReferenceField
        label="Req Parent Rank"
        source="required_parent_rank_id"
        reference="taxon_ranks"
      >
        <NumberField source="rank_name" />
      </ReferenceField>
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="created_on" />
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="updated_on" />
      <EditButton />
    </Datagrid>
  </List>
);
