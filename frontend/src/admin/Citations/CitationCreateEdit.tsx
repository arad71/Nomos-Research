import {
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
} from 'react-admin';
import React, { FC } from 'react';
import AuthorType from './AuthorType';

export const CitationCreateEdit: FC = (props) => (
  <SimpleForm {...props} warnWhenUnsavedChanges>
    <ReferenceInput
      source="taxon_name_id"
      reference="taxon_names"
      validate={required()}
    >
      <SelectInput optionText="scientific_name" />
    </ReferenceInput>
    <ReferenceInput
      source="author_id"
      reference="authors"
      validate={required()}
    >
      <SelectInput optionText="abbreviation" />
    </ReferenceInput>
    <SelectInput source="author_type" choices={AuthorType} />
    <NumberInput source="author_order" validate={required()} initialValue={0} />
  </SimpleForm>
);
