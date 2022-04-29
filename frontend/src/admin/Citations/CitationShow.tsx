// in src/users.js
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
import AuthorType from './AuthorType';
import Aside from '../shared/Aside';

export const CitationShow: FC = (props) => (
  <Show aside={<Aside />} {...props}>
    <SimpleShowLayout>
      <ReferenceField source="taxon_name_id" reference="taxon_names">
        <RichTextField source="formatted_scientific_name" />
      </ReferenceField>
      <ReferenceField source="author_id" reference="authors">
        <TextField source="author" />
      </ReferenceField>
      <SelectField source="author_type" choices={AuthorType} />
      <NumberField source="author_order" />
    </SimpleShowLayout>
  </Show>
);
