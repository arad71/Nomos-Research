import React, { FC } from 'react';
import {
  Create,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import Aside from '../shared/Aside';
import BooleanOptions from '../shared/BooleanOptions';
import LanguageType from './LanguageType';

export const VernacularCreate: FC = (props) => (
  <Create {...props} aside={<Aside />}>
    <SimpleForm>
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
  </Create>
);
