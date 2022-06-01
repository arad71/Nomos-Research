import { RowForm, RowFormProps } from '@react-admin/ra-editable-datagrid';
import { AuthorAutocomplete } from '../Authors';
import { NumberInput, required, SelectInput } from 'react-admin';
import AuthorType from './AuthorType';
import React from 'react';

export const CitationRowForm = (props: RowFormProps) => (
  <RowForm {...props}>
    <AuthorAutocomplete />
    <SelectInput
      source="author_type"
      validate={required()}
      choices={AuthorType}
    />
    <NumberInput source="author_order" validate={required()} initialValue={0} />
  </RowForm>
);
