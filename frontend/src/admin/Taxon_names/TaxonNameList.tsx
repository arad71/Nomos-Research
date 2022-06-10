import React from 'react';
import {
  BooleanField,
  CreateButton,
  Datagrid,
  DateField,
  EditButton,
  ExportButton,
  FilterButton,
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
  TopToolbar,
} from 'react-admin';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { List, WithPermissions } from '@react-admin/ra-rbac';

import {
  ListProps,
  SelectColumnsButton,
  useSelectedColumns,
} from '@react-admin/ra-preferences';
import { TaxonNameFilters } from './TaxonNameFilters';
import ResetPreferenceButton from '../shared/ResetPreferenceButton';
import { DefaultPagination, useCanBulkDelete } from '../shared';

const postListColumns = {
  id: <TextField source="id" />,
  rank_id: (
    <ReferenceField
      source="rank_id"
      reference="taxon_ranks"
      sortBy="taxon_rank___rank_name"
    >
      <TextField source="rank_name" />
    </ReferenceField>
  ),
  formatted_scientific_name: (
    <RichTextField source="formatted_scientific_name" />
  ),

  author: <TextField source="author" />,

  form_desc_yr: <TextField source="form_desc_yr" label="Year Published" />,
  kingdom_id: (
    <ReferenceField
      source="kingdom_id"
      reference="kingdoms"
      sortBy="kingdom___kingdom_name"
    >
      <TextField source="kingdom_name" />
    </ReferenceField>
  ),
  canonical_name: <RichTextField source="canonical_name" />,
  scientific_name: <TextField source="scientific_name" />,
  phylum: <TextField source="phylum" />,
  taxon_class: <TextField source="taxon_class" />,
  order: <TextField source="order" />,
  family: <TextField source="family" />,
  genus: <TextField source="genus" />,
  subgenus: <TextField source="subgenus" />,
  species: <TextField source="species" />,
  subspecies: <TextField source="subspecies" />,
  uninomial: <TextField source="uninomial" />,
  specific_epithet: <TextField source="specific_epithet" />,
  infraspecific_epithet: <TextField source="infraspecific_epithet" />,
  publication_id: (
    <ReferenceField
      source="publication_id"
      reference="publications"
      sortBy="publication___title"
    >
      <TextField source="title" />
    </ReferenceField>
  ),
  volume_information: <TextField source="volume_information" />,
  is_current: <BooleanField source="is_current" label="Is current?" />,
  origin: <TextField source="origin" />,
  publication_status: (
    <SelectField source="publication_status" choices={PublicationStatus} />
  ),
  form_desc_mn: <NumberField source="form_desc_mn" />,
  form_desc_dy: <NumberField source="form_desc_dy" />,
  comments: <TextField source="comments" />,
  contributed_by: <TextField source="contributed_by" />,
  contributed_on: <DateField source="contributed_on" showTime />,
  validated: <BooleanField source="validated" label="Is validated?" />,
  source: <TextField source="source" />,
  external_id: <TextField source="external_id" />,
  family_code: <TextField source="family_code" />,
  vernacular: <TextField source="vernacular" />,
  editor: <TextField source="editor" />,
  naturalised_status: (
    <SelectField source="naturalised_status" choices={NaturalisedStatus} />
  ),
  naturalised_certainty: <BooleanField source="naturalised_certainty" />,
  is_eradicated: <TextField source="is_eradicated" />,
  naturalised_comments: <TextField source="naturalised_comments" />,
  linear_sequence: <NumberField source="linear_sequence" />,
  family_nid: (
    <ReferenceField
      label="Family"
      source="family_nid"
      reference="taxon_names"
      sortBy="family"
    >
      <RichTextField source="formatted_scientific_name" />
    </ReferenceField>
  ),
  all_vernaculars: <TextField source="all_vernaculars" />,
  notes: <TextField source="notes" />,
  authorised_on: <DateField source="authorised_on" />,
  created_by: (
    <ReferenceField source="created_by" reference="users">
      <TextField source="full_name" />
    </ReferenceField>
  ),
  created_on: <DateField source="created_on" />,
  updated_by: (
    <ReferenceField source="updated_by" reference="users">
      <TextField source="full_name" />
    </ReferenceField>
  ),
  updated_on: <DateField source="updated_on" />,
};

const includeColumns = new Set([
  'rank_id',
  'formatted_scientific_name',
  'author',
  'form_desc_yr',
  'is_current',
  'publication_status',
  'all_vernaculars',
  'updated_on',
  'created_on',
]);
const excludeColumns = Object.keys(postListColumns).filter((name: string) => {
  return !includeColumns.has(name);
});
const TAXON_NAMES_PREFERENCE = 'taxon_names.list.columns';

const Actions = () => (
  <TopToolbar>
    <FilterButton />
    <SelectColumnsButton
      preference={TAXON_NAMES_PREFERENCE}
      columns={postListColumns}
    />
    <ResetPreferenceButton
      label="Reset"
      preferenceName={TAXON_NAMES_PREFERENCE}
      defaultValue={Array.from(includeColumns)}
    />
    <WithPermissions resource="taxon_names" action="create">
      <CreateButton />
    </WithPermissions>
    <WithPermissions resource="taxon_names" action="export">
      <ExportButton maxResults={100000} />
    </WithPermissions>
  </TopToolbar>
);

export const TaxonNameList = (props: ListProps) => {
  const columns = useSelectedColumns({
    preferences: TAXON_NAMES_PREFERENCE,
    columns: postListColumns,
    omit: excludeColumns,
  });

  return (
    <List
      sort={{ field: 'updated_on', order: 'DESC' }}
      actions={<Actions />}
      perPage={100}
      filters={TaxonNameFilters}
      pagination={<DefaultPagination />}
      bulkActionButtons={useCanBulkDelete()}
      {...props}
    >
      <Datagrid rowClick="show">
        {columns}

        <WithPermissions resource="taxon_names" action="edit">
          <EditButton />
        </WithPermissions>
      </Datagrid>
    </List>
  );
};
