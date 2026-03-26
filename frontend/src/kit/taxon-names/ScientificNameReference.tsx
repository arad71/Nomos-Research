import { AutocompleteInput, ReferenceInput } from 'react-admin';
import React from 'react';

const ScientificNameReference = ({
  validate,
  perPage = 100,
  sort = { field: 'canonical_name', order: 'ASC' },
  filter = {},
  ...referenceInputProps
}: {
  source: string;
  label?: string;
  sort?: object;
  validate?: any;
  perPage?: number;
  filter?: object;
  helperText?: string;
  fullWidth?: boolean;
}) => (
  <ReferenceInput
    reference="taxon_names"
    filterToQuery={(searchText: string) => ({
      scientific_name__ilike: `%${searchText}%`,
    })}
    perPage={perPage}
    sort={sort}
    filter={filter}
    {...referenceInputProps}
  >
    <AutocompleteInput optionText="scientific_name" validate={validate} />
  </ReferenceInput>
);

export default ScientificNameReference;
