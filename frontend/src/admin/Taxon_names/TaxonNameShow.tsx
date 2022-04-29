// in src/users.js
import React, { FC } from 'react';
import {
  DateField,
  EditButton,
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  SelectField,
  TextField,
  BooleanField,
  RichTextField,
} from 'react-admin';
import Aside from '../shared/Aside';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';

export const TaxonNameShow: FC = (props) => (
  <Show aside={<Aside />} {...props}>
    <SimpleShowLayout>
      <ReferenceField source="kingdom_id" reference="kingdoms">
        <TextField source="kingdom_name" />
      </ReferenceField>
      <ReferenceField source="rank_id" reference="taxon_ranks">
        <TextField source="rank_name" />
      </ReferenceField>
      <TextField source="canonical_name" />
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
      <ReferenceField source="publication_id" reference="publications">
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
      >
        <TextField source="scientific_name" />
      </ReferenceField>
      <TextField source="all_vernaculars" />
      <TextField source="notes" />
      <DateField source="authorised_on" showTime />
      <EditButton />
    </SimpleShowLayout>
  </Show>
);
