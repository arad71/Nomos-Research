// in src/users.js
import React, { FC } from 'react';
import {
  Datagrid,
  DateField,
  EditButton,
  List,
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
  BooleanField,
} from 'react-admin';
import FullNameField from '../shared/FullNameField';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { FilterSidebar } from './FilterSidebar';
import { TopToolbar } from 'react-admin';
import {
  ListProps,
  SelectColumnsButton,
  useSelectedColumns,
} from '@react-admin/ra-preferences';
const postListColumns = {
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
  class: <TextField source="class" />,
  order: <TextField source="order" />,
  family: <TextField source="family" />,
  genus: <TextField source="genus" />,
  sub_genus: <TextField source="sub_genus" />,
  species: <TextField source="species" />,
  sub_species: <TextField source="sub_species" />,
  specific_epithet: <TextField source="specific_epithet" />,
  infraspecific_epithet: <TextField source="infraspecific_epithet" />,

  publication_id: (
    <ReferenceField
      source="publication_id"
      reference="publications"
      sortBy="publications___publication"
    >
      <TextField source="publication_name" />
    </ReferenceField>
  ),
  volume_information: <TextField source="volume_information" />,
  is_current: <BooleanField source="is_current" />,
  origin: <TextField source="origin" />,
  publication_status: (
    <SelectField source="publication_status" choices={PublicationStatus} />
  ),
  form_desc_mn: <NumberField source="form_desc_mn" />,
  form_desc_dy: <NumberField source="form_desc_dy" />,
  comments: <TextField source="comments" />,
  contributed_by: <TextField source="contributed_by" />,
  contributed_on: <DateField source="contributed_on" showTime />,
  validated: <BooleanField source="validated" />,
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
  authorised_on: <DateField source="authorised_on" showTime />,
  created_by: (
    <ReferenceField source="created_by" reference="users">
      <FullNameField source="last_name" />
    </ReferenceField>
  ),
  created_on: <DateField source="created_on" showTime />,
  updated_by: (
    <ReferenceField source="updated_by" reference="users">
      <FullNameField source="last_name" />
    </ReferenceField>
  ),
  updated_on: <DateField source="updated_on" showTime />,
};
// add the <SelectColumnsButton> to the toolbar
const PostActions = () => (
  <TopToolbar>
    <SelectColumnsButton
      preference="taxon_names.list.columns"
      columns={postListColumns}
    />
  </TopToolbar>
);
export const TaxonNameList = (props: ListProps) => {
  const columns = useSelectedColumns({
    preferences: 'taxon_name.list.columns',
    columns: postListColumns,
    omit: ['rank_id'],
  });
  return (
    <List actions={<PostActions />} aside={<FilterSidebar />} {...props}>
      <Datagrid rowClick="show">
        {columns}
        <EditButton />
      </Datagrid>
    </List>
  );
};
