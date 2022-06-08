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
import RankAbbreviation from './RankAbbreviation';
import { WithPermissions, List } from '@react-admin/ra-rbac';
import { DefaultPagination, useCanBulkDelete } from '../shared';

export const TaxonRankList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'rank_name' }}
    perPage={100}
    pagination={<DefaultPagination />}
    bulkActionButtons={useCanBulkDelete()}
  >
    <Datagrid rowClick="show">
      <TextField source="id" />
      <ReferenceField
        source="kingdom_id"
        reference="kingdoms"
        sortBy="kingdom___kingdom_name"
      >
        <TextField source="kingdom_name" />
      </ReferenceField>
      <TextField source="rank_name" />
      <SelectField source="rank_abbrev" choices={RankAbbreviation} />
      <ReferenceField
        label="Direct Parent Rank"
        source="direct_parent_rank_id"
        reference="taxon_ranks"
        sortBy="direct_parent_rank___rank_name"
      >
        <NumberField source="rank_name" />
      </ReferenceField>
      <ReferenceField
        label="Req Parent Rank"
        source="required_parent_rank_id"
        reference="taxon_ranks"
        sortBy="required_parent_rank___rank_name"
      >
        <TextField source="rank_name" />
      </ReferenceField>
      <BooleanField source="uninomial" />
      <ReferenceField source="created_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="created_on" showTime />
      <ReferenceField source="updated_by" reference="users">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" showTime />

      <WithPermissions resource="taxon_ranks" action="edit">
        <EditButton />
      </WithPermissions>
    </Datagrid>
  </List>
);
