import {
  BooleanInput,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import React, { FC } from 'react';
import BadPublicationOptions from './BadPublicationOptions';
import RichTextInput from 'ra-input-rich-text';

export const PublicationCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <TextInput source="publication" validate={[required()]} />
    <SelectInput source="bad_publication" choices={BadPublicationOptions} />
    <TextInput source="publication_name" />
    <TextInput source="doi" />
    <TextInput source="title" />
    <TextInput source="display_title" />
    <TextInput source="abbreviated_title" />
    <NumberInput source="year" />
    <TextInput source="volume" />
    <TextInput source="edition" />
    <TextInput source="pages" />
    <TextInput source="verbatim_reference" />
    <TextInput source="verbatim_citation" />
    <TextInput source="verbatim_author" />
    <TextInput source="citation" />
    <RichTextInput source="citation_html" />
    <TextInput source="citation_author_year" />
    <TextInput source="notes" />
    <BooleanInput label="Published" source="published" />
    <TextInput source="publisher" />
    <TextInput source="published_location" />
    <TextInput source="publication_date" />
    <TextInput source="isbn" />
    <TextInput source="issn" />
    <TextInput source="bhl_url" />
    <TextInput source="tl2" />
    <TextInput source="reference_type" />
    <ReferenceInput label="Parent" source="parent_id" reference="publications">
      <SelectInput optionText="publication" />
    </ReferenceInput>
    <TextInput source="reference_author_role" />
    <TextInput source="language" />
    <ReferenceInput
      label="Duplicate Of"
      source="duplicate_of_id"
      reference="publications"
    >
      <SelectInput optionText="publication" />
    </ReferenceInput>
  </SimpleForm>
);
