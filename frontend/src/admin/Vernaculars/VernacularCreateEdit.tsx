import {
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import React, { FC } from 'react';
import LanguageType from './LanguageType';
import BooleanOptions from '../shared/BooleanOptions';

export const VernacularCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <TextInput source="vernacular" validate={required()} />
    <ReferenceInput source="taxon_name_id" reference="taxon_names">
      <SelectInput optionText="scientific_name" validate={required()} />
    </ReferenceInput>
    <SelectInput
      source="language"
      choices={LanguageType}
      validate={required()}
    />
    <SelectInput
      source="lang_pref"
      choices={BooleanOptions}
      validate={required()}
    />
    <SelectInput
      source="preferred"
      choices={BooleanOptions}
      validate={required()}
    />
    <TextInput source="source" />
    <SelectInput
      source="enabled"
      choices={BooleanOptions}
      validate={required()}
    />
    <NumberInput source="sort_order" />
  </SimpleForm>
);
