import {
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanInput,
} from 'react-admin';
import React, { FC } from 'react';
import CrossRefType from './CrossRefType';

export const CrossRefCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <ReferenceInput source="old_name_id" reference="taxon_names">
      <SelectInput optionText="scientific_name" validate={required()} />
    </ReferenceInput>
    <ReferenceInput source="new_name_id" reference="taxon_names">
      <SelectInput optionText="scientific_name" />
    </ReferenceInput>
    <SelectInput
      source="cross_reference_type"
      choices={CrossRefType}
      validate={required()}
    />
    <BooleanInput label="Active" source="active" validate={required()} />
    <TextInput source="authorised_by" />
    <TextInput multiline source="comments" />
    <TextInput multiline source="notes" />
  </SimpleForm>
);
