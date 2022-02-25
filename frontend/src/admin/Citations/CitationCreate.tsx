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
      <SelectInput
        source="author_type"
        choices={[
          { id: 'basionym', name: 'basionym' },
          { id: 'current', name: 'current' },
          { id: 'editor', name: 'editor' },
        ]}
      />
      <TextInput source="author_order" />
    </SimpleForm>
  </Create>
);
