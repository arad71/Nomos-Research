import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  SelectInput,
  ReferenceInput,
  required,
  TextInput,
} from 'react-admin';
import BooleanOptions from '../shared/BooleanOptions';
import CrossRefType from './CrossRefType';

export const CrossReferenceCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput source="old_name_id" reference="taxon_names">
        <SelectInput optionText="rank_name" validate={required()} />
      </ReferenceInput>
      <ReferenceInput source="new_name_id" reference="taxon_names">
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
      <SelectInput
        source="cross_reference_type"
        choices={CrossRefType}
        validate={required()}
      />
      <SelectInput
        source="active"
        choices={BooleanOptions}
        validate={required()}
      />
      <TextInput source="authorised_by" />
      <TextInput multiline source="comments" />
      <TextInput multiline source="notes" />
    </SimpleForm>
  </Create>
);
