import {
  InlineRowForm as RowForm,
  InlineRowFormProps as RowFormProps,
} from '../shared/InlineRowForm';
// import { AuthorAutocomplete } from '../Authors';
import {
  DateInput,
  required,
  TextInput,
  SelectInput,
  ReferenceInput,
} from 'react-admin';
import { ConservationShort } from '../Conservation_codes/ConservationShort';
import React from 'react';

export const ConscodesTaxonRowForm = (props: RowFormProps) => {
  return (
    <RowForm {...props}>
      <ReferenceInput
        source="conservation_code_id"
        reference="conservation_codes"
        label="Conservation code"
        sort={{
          field: 'conservation_code_value',
          order: 'ASC',
        }}
      >
        <SelectInput
          optionText={<ConservationShort source="conservation_code_id" />}
          validate={required()}
        />
      </ReferenceInput>
      <DateInput source="effective_from" />
      <DateInput source="effective_to" />
      <TextInput source="notes" />
    </RowForm>
  );
};
