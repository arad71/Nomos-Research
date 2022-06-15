import { RowForm, RowFormProps } from '@react-admin/ra-editable-datagrid';
import {
  NumberInput,
  required,
  SelectInput,
  BooleanInput,
  TextInput,
} from 'react-admin';
import LanguageType from './LanguageType';
import React from 'react';

export const VernacularRowForm = (props: RowFormProps) => (
  <RowForm {...props}>
    <TextInput source="vernacular" />
    <SelectInput
      source="language"
      validate={required()}
      choices={LanguageType}
    />
    <BooleanInput source="lang_pref" />
    <BooleanInput source="preferred" />
    <NumberInput source="sort_order" validate={required()} initialValue={0} />
  </RowForm>
);
