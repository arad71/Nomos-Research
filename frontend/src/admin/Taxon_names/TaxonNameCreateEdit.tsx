import {
  DateTimeInput,
  NumberInput,
  ReferenceInput,
  required,
  RichTextField,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  BooleanInput,
  NullableBooleanInput,
} from 'react-admin';

import React, { FC } from 'react';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';

export const TaxonNameCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <ReferenceInput
      source="kingdom_id"
      reference="kingdoms"
      validate={[required()]}
    >
      <SelectInput optionText="kingdom_name" />
    </ReferenceInput>
    <ReferenceInput
      source="rank_id"
      reference="taxon_ranks"
      validate={[required()]}
    >
      <SelectInput optionText="rank_name" />
    </ReferenceInput>
    <TextField source="canonical_name" />
    <TextField source="scientific_name" />
    <RichTextField source="formatted_scientific_name" />
    <TextInput source="phylum" />
    <TextInput source="taxon_class" label="Class" />
    <TextInput source="order" />
    <TextInput source="family" />
    <TextInput source="genus" />
    <TextInput source="subgenus" />
    <TextInput source="species" />
    <TextInput source="subspecies" />
    <TextInput source="specific_epithet" />
    <TextInput source="infraspecific_epithet" />
    <ReferenceInput source="publication_id" reference="publications">
      <SelectInput optionText="publication_name" />
    </ReferenceInput>
    <TextInput source="volume_information" />
    <BooleanInput
      label="Current"
      source="is_current"
      validate={required()}
      defaultValue={false}
    />
    <TextInput source="origin" />
    <SelectInput source="publication_status" choices={PublicationStatus} />
    <NumberInput source="form_desc_yr" />
    <NumberInput source="form_desc_mn" />
    <NumberInput source="form_desc_dy" />
    <TextInput multiline source="comments" />
    <TextInput source="contributed_by" />
    <DateTimeInput source="contributed_on" />
    <BooleanInput
      label="Validated"
      source="validated"
      validate={required()}
      defaultValue={false}
    />
    <TextInput source="source" />
    <TextInput source="external_id" />
    <TextInput source="family_code" />
    <TextField source="author" />
    <TextInput source="vernacular" />
    <TextField source="editor" />
    <SelectInput source="naturalised_status" choices={NaturalisedStatus} />
    <NullableBooleanInput
      label="Naturalised Certainty"
      source="naturalised_certainty"
    />
    <TextInput source="is_eradicated" />
    <TextInput multiline source="naturalised_comments" />
    <NumberInput source="linear_sequence" />
    <ReferenceInput
      label="Family NID"
      source="family_nid"
      reference="taxon_names"
    >
      <SelectInput optionText="scientific_name" />
    </ReferenceInput>
    <TextInput multiline source="all_vernaculars" />
    <TextInput multiline source="notes" />
    <DateTimeInput source="authorised_on" />
  </SimpleForm>
);
