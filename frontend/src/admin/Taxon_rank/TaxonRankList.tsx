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
import { List } from '@react-admin/ra-rbac';
import { CanAccess as IfCanAccess } from 'react-admin';
import {
  DefaultPagination,
  selectableFilters,
  useCanBulkDelete,
} from '../shared';

export const TaxonRankList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'rank_name', order: 'ASC' }}
    perPage={100}
    pagination={<DefaultPagination />}
    filters={selectableFilters()}
  >
    <Datagrid bulkActionButtons={useCanBulkDelete()} rowClick="show">
      <ReferenceField
        source="kingdom_id"
        reference="kingdoms"
        sortBy="kingdom___kingdom_name"
        link="show"
      >
        <TextField source="kingdom_name" />
      </ReferenceField>
      <TextField source="rank_name" label="Rank" />
      <SelectField
        source="rank_abbrev"
        label="Rank abbreviation"
        choices={RankAbbreviation}
      />
      <ReferenceField
        label="Direct Parent Rank"
        source="direct_parent_rank_id"
        reference="taxon_ranks"
        sortBy="direct_parent_rank___rank_name"
        link="show"
      >
        <NumberField source="rank_name" />
      </ReferenceField>
      <ReferenceField
        label="Required Parent Rank"
        source="required_parent_rank_id"
        reference="taxon_ranks"
        sortBy="required_parent_rank___rank_name"
        link="show"
      >
        <TextField source="rank_name" />
      </ReferenceField>
      <BooleanField source="uninomial" />
      <ReferenceField source="updated_by" reference="users" link="show">
        <TextField source="full_name" />
      </ReferenceField>
      <DateField source="updated_on" />

      <IfCanAccess resource="taxon_ranks" action="edit">
        <EditButton />
      </IfCanAccess>
    </Datagrid>
  </List>
);
