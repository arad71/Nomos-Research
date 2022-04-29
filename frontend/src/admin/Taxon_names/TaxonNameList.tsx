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

export const TaxonNameList: FC = (props) => (
  <List {...props} sort={{ field: 'scientific_name' }}>
    <Datagrid rowClick="show">
      <ReferenceField
        source="kingdom_id"
        reference="kingdoms"
        sortBy="kingdom___kingdom_name"
      >
        <TextField source="kingdom_name" />
      </ReferenceField>
      <ReferenceField
        source="rank_id"
        reference="taxon_ranks"
        sortBy="taxon_rank___rank_name"
      >
        <TextField source="rank_name" />
      </ReferenceField>
      <TextField source="scientific_name" />
      <RichTextField source="formatted_scientific_name" />
      <TextField source="phylum" />
      <TextField source="class" />
      <TextField source="order" />
      <TextField source="family" />
      <TextField source="genus" />
      <TextField source="sub_genus" />
      <TextField source="species" />
      <TextField source="sub_species" />
      <TextField source="specific_epithet" />
      <TextField source="infraspecific_epithet" />
      <ReferenceField
        source="publication_id"
        reference="publications"
        sortBy="publications___publication"
      >
        <TextField source="publication_name" />
      </ReferenceField>
      <TextField source="volume_information" />
      <BooleanField source="is_current" />
      <TextField source="origin" />
      <SelectField source="publication_status" choices={PublicationStatus} />
      <NumberField source="form_desc_yr" />
      <NumberField source="form_desc_mn" />
      <NumberField source="form_desc_dy" />
      <TextField source="comments" />
      <TextField source="contributed_by" />
      <DateField source="contributed_on" showTime />
      <BooleanField source="validated" />
      <TextField source="source" />
      <TextField source="external_id" />
      <TextField source="family_code" />
      <TextField source="author" />
      <TextField source="vernacular" />
      <TextField source="editor" />
      <SelectField source="naturalised_status" choices={NaturalisedStatus} />
      <BooleanField source="naturalised_certainty" />
      <TextField source="is_eradicated" />
      <TextField source="naturalised_comments" />
      <NumberField source="linear_sequence" />
      <ReferenceField
        label="Family"
        source="family_nid"
        reference="taxon_names"
        sortBy="family"
      >
        <TextField source="scientific_name" />
      </ReferenceField>
      <TextField source="all_vernaculars" />
      <TextField source="notes" />
      <DateField source="authorised_on" showTime />
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
