import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
} from 'react-admin';

export const PublicationCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <SelectInput
        source="bad_publication"
        choices={[
          { id: 'Y', name: 'Y' },
          { id: 'Y', name: 'N' },
        ]}
      />
      <TextInput source="publication" />
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
      <TextInput source="citation_html" />
      <TextInput source="citation_author_year" />
      <TextInput source="notes" />
      <SelectInput
        source="published"
        choices={[
          { id: 'Y', name: 'Y' },
          { id: 'Y', name: 'N' },
        ]}
      />
      <TextInput source="publisher" />
      <TextInput source="published_location" />
      <TextInput source="publication_date" />
      <TextInput source="isbn" />
      <TextInput source="issn" />
      <TextInput source="bhl_url" />
      <TextInput source="tl2" />
      <TextInput source="reference_type" />
      <ReferenceInput label="Parent" source="parent" reference="publications">
        <SelectInput optionText="publication" />
      </ReferenceInput>
      <TextInput source="reference_author_role" />
      <TextInput source="language" />
      <ReferenceInput
        label="Duplicate Of"
        source="duplicate_of"
        reference="publications"
      >
        <SelectInput optionText="publication" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);
