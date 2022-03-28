import {
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanInput,
} from 'react-admin';
import React, { FC } from 'react';
import LanguageType from './LanguageType';

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
    <BooleanInput label="Lang Pref" source="lang_pref" validate={required()} />
    <BooleanInput label="preferred" source="preferred" validate={required()} />
    <TextInput source="source" />
    <BooleanInput label="Enabled" source="enabled" validate={required()} />
    <NumberInput source="sort_order" />
  </SimpleForm>
);
