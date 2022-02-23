import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  SelectInput,
} from 'react-admin';

export const CitationCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput source="taxon_name_id" reference="taxon_names">
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
      <ReferenceInput source="author_id" reference="authors">
        <SelectInput optionText="author" />
      </ReferenceInput>
      <TextInput source="author_type" />
      <TextInput source="author_order" />
    </SimpleForm>
  </Create>
);
