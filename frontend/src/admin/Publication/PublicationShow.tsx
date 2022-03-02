import React, { FC } from 'react';
import {
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import BadPublicationOptions from './BadPublicationOptions';
import Aside from "../shared/Aside";

export const PublicationShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="publication" />
        <SelectField source="bad_publication" choices={BadPublicationOptions} />
        <TextField source="publication_name" />
        <TextField source="doi" />
        <TextField source="title" />
        <TextField source="display_title" />
        <TextField source="abbreviated_title" />
        <NumberField source="year" />
        <TextField source="volume" />
        <TextField source="edition" />
        <TextField source="pages" />
        <TextField source="verbatim_reference" />
        <TextField source="verbatim_citation" />
        <TextField source="verbatim_author" />
        <TextField source="citation" />
        <RichTextField source="citation_html" />
        <TextField source="citation_author_year" />
        <TextField source="notes" />
        <TextField source="published" />
        <TextField source="publisher" />
        <TextField source="published_location" />
        <TextField source="published_date" />
        <TextField source="isbn" />
        <TextField source="issn" />
        <TextField source="bhl_url" />
        <TextField source="tl2" />
        <TextField source="reference_type" />
        <ReferenceField
          label="Parent"
          source="parent_id"
          reference="publications"
        >
          <TextField source="publication" />
        </ReferenceField>
        <TextField source="reference_author_role" />
        <TextField source="language" />
        <ReferenceField
          label="Duplicate Of"
          source="duplicate_of_id"
          reference="publications"
        >
          <TextField source="publication" />
        </ReferenceField>
      </SimpleShowLayout>
    </Show>
  );
};
