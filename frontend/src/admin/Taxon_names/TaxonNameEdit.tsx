import React, { FC } from 'react';
import {
  DateTimeInput,
  Edit,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import BooleanOptions from "../shared/BooleanOptions";
import NaturalisedStatus from "./NaturalisedStatus";

export const TaxonNameEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
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
      <TextInput source="rank_name" validate={[required()]} />
      <TextInput source="uninomial" />
      <TextInput source="phylum" />
      <TextInput source="class" />
      <TextInput source="order" />
      <TextInput source="family" />
      <TextInput source="genus" />
      <TextInput source="sub_genus" />
      <TextInput source="scientific_name" />
      <TextInput source="species" />
      <TextInput source="sub_species" />
      <TextInput source="specific_epithet" />
      <TextInput source="infraspecific_epithet" />
      <ReferenceInput source="publication_id" reference="publications">
        <SelectInput optionText="publication_name" />
      </ReferenceInput>
      <TextInput source="volume_information" />
      <SelectInput source="is_current" choices={BooleanOptions} />
      <TextInput source="origin" />
      <TextInput source="informal" />
      <NumberInput source="form_desc_yr" />
      <NumberInput source="form_desc_mn" />
      <NumberInput source="form_desc_dy" />
      <TextInput multiline source="comments" />
      <TextInput source="contributed_by" />
      <DateTimeInput source="contributed_on" />
      <SelectInput source="validated" choices={BooleanOptions} validate={[required()]} />
      <TextInput source="source" />
      <TextInput source="external_id" />
      <TextInput source="family_code" />
      <TextInput source="author" />
      <TextInput source="vernacular" />
      <TextInput source="editor" />
      <SelectInput source="naturalised_status" choices={NaturalisedStatus} />
      <SelectInput source="naturalised_certainty" choices={BooleanOptions} />
      <TextInput source="is_eradicated" />
      <TextInput multiline source="naturalised_comments" />
      <NumberInput source="linear_sequence" />
      <ReferenceInput
        label="Family NID"
        source="family_nid"
        reference="taxon_names"
      >
        <SelectInput optionText="id" />
      </ReferenceInput>
      <TextInput multiline source="all_vernaculars" />
      <TextInput multiline source="notes" />
      <DateTimeInput source="authorised_on" />
    </SimpleForm>
  </Edit>
);
