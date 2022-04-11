// in src/users.js
import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  NumberField,
  ReferenceField,
  TextField,
} from 'react-admin';
import FullNameField from '../shared/FullNameField';

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
        <TextField source="rank_name" />
      </ReferenceField>
      <TextField source="uninomial" />
      <ReferenceField source="created_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <FullNameField source="last_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />
      <EditButton />
    </Datagrid>
  </List>
);
