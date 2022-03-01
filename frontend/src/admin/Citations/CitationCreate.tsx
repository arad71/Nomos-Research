import React, { FC } from 'react';
import {
  NumberInput,
  required,
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
} from 'react-admin';
import AuthorType from './AuthorType';

export const CitationCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput
        source="taxon_name_id"
        reference="taxon_names"
        validate={required()}
      >
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
      <ReferenceInput
        source="author_id"
        reference="authors"
        validate={required()}
      >
        <SelectInput optionText="author" />
      </ReferenceInput>
      <SelectInput source="author_type" choices={AuthorType} />
      <NumberInput
        source="author_order"
        validate={required()}
        initialValue={0}
      />
    </SimpleForm>
  </Create>
);
