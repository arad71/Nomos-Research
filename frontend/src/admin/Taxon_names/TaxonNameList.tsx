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
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';

import {
  ListProps,
  SelectColumnsButton,
  useSelectedColumns,
} from '@react-admin/ra-preferences';
import { TaxonNameFilters } from './TaxonNameFilters';
import ResetPreferenceButton from '../shared/ResetPreferenceButton';
import { DefaultPagination, useCanBulkDelete } from '../shared';
import { MAX_RESULTS } from '../../config';
import NestedLinkField from '../shared/NestedLinkField';
import BatchExportButton from '../shared/BatchExportButton';

const postListColumns = {
  id: <TextField source="id" />,
  rank: (
    <NestedLinkField
      source="taxon_rank"
      reference="taxon_ranks"
      label="Taxon rank"
      sortBy="taxon_rank___rank_name"
      idKey="taxon_rank_id"
      labelKey="rank_name"
    />
  ),
  formatted_scientific_name: (
    <RichTextField source="formatted_scientific_name" />
  ),

  author: <TextField source="author" />,

  form_desc_yr: <TextField source="form_desc_yr" label="Year Published" />,
  kingdom: (
    <NestedLinkField
      source="kingdom"
      reference="kingdoms"
      label="Kingdom"
      sortBy="kingdom___kingdom_name"
      idKey="kingdom_id"
      labelKey="kingdom_name"
    />
  ),
  canonical_name: <RichTextField source="canonical_name" />,
  scientific_name: <TextField source="scientific_name" />,
  division: (
    <ReferenceField
      label="Division"
      source="id"
      reference={`taxon_names_ancestors/Division`}
      link={false}
      sortable={false}
    >
      <RichTextField source="ancestor_name__formatted_scientific_name" />
    </ReferenceField>
  ),
  phylum: (
    <ReferenceField
      label="Phylum"
      source="id"
      reference={`taxon_names_ancestors/Phylum`}
      link={false}
      sortable={false}
    >
      <RichTextField source="ancestor_name__formatted_scientific_name" />
    </ReferenceField>
  ),
  taxon_class: (
    <ReferenceField
      label="Class"
      source="id"
      reference={`taxon_names_ancestors/Class`}
      link={false}
      sortable={false}
    >
      <RichTextField source="ancestor_name__formatted_scientific_name" />
    </ReferenceField>
  ),
  order: (
    <ReferenceField
      label="Order"
      source="id"
      reference={`taxon_names_ancestors/Order`}
      link={false}
      sortable={false}
    >
      <RichTextField source="ancestor_name__formatted_scientific_name" />
    </ReferenceField>
  ),
  family: (
    <ReferenceField
      label="Family"
      source="id"
      reference={`taxon_names_ancestors/Family`}
      link={false}
      sortable={false}
    >
      <RichTextField source="ancestor_name__formatted_scientific_name" />
    </ReferenceField>
  ),
  genus: (
    <ReferenceField
      label="Genus"
      source="id"
      reference={`taxon_names_ancestors/Genus`}
      link={false}
      sortable={false}
    >
      <RichTextField source="ancestor_name__formatted_scientific_name" />
    </ReferenceField>
  ),
  subgenus: (
    <ReferenceField
      label="Subgenus"
      source="id"
      reference={`taxon_names_ancestors/Subgenus`}
      link={false}
      sortable={false}
    >
      <RichTextField source="ancestor_name__formatted_scientific_name" />
    </ReferenceField>
  ),
  species: (
    <ReferenceField
      label="Species"
      source="id"
      reference={`taxon_names_ancestors/Species`}
      link={false}
      sortable={false}
    >
      <RichTextField source="ancestor_name__formatted_scientific_name" />
    </ReferenceField>
  ),
  subspecies: (
    <ReferenceField
      label="Subspecies"
      source="id"
      reference={`taxon_names_ancestors/Subspecies`}
      link={false}
      sortable={false}
    >
      <RichTextField source="ancestor_name__formatted_scientific_name" />
    </ReferenceField>
  ),
  uninomial: <TextField source="uninomial" />,
  specific_epithet: <TextField source="specific_epithet" />,
  infraspecific_epithet: <TextField source="infraspecific_epithet" />,
  publication_id: (
    <ReferenceField
      source="publication_id"
      reference="publications"
      sortBy="publication___title"
      link="show"
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
      link="show"
    >
      <RichTextField source="formatted_scientific_name" />
    </ReferenceField>
  ),
  all_vernaculars: <TextField source="all_vernaculars" />,
  notes: <TextField source="notes" />,
  admin_comment: <TextField source="admin_comment" />,
  authorised_on: <DateField source="authorised_on" />,
  created_by: (
    <ReferenceField source="created_by" reference="users" link="show">
      <TextField source="full_name" />
    </ReferenceField>
  ),
  created_on: <DateField source="created_on" />,
  updated_by: (
    <ReferenceField source="updated_by" reference="users" link="show">
      <TextField source="full_name" />
    </ReferenceField>
  ),
  updated_on: <DateField source="updated_on" />,
};

const includeColumns = new Set([
  'rank',
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

const CustomExportButton = (props) => (
  <ExportButton {...props}>
    <BatchExportButton />
  </ExportButton>
);
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
      {/*<ExportButton maxResults={MAX_RESULTS} />*/}
      <BatchExportButton />
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
      filters={TaxonNameFilters()}
      pagination={<DefaultPagination />}
      bulkActionButtons={useCanBulkDelete()}
      {...props}
    >
      <Datagrid rowClick="show">
        {columns}
        <WithPermissions resource="taxon_names" action="viewdeleted">
          <BooleanField
            source="deleted"
            TrueIcon={DeleteIcon}
            FalseIcon={VisibilityIcon}
          />
        </WithPermissions>
        <WithPermissions resource="taxon_names" action="edit">
          <EditButton />
        </WithPermissions>
      </Datagrid>
    </List>
  );
};
