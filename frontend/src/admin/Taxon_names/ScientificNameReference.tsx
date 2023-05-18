import { AutocompleteInput, ReferenceInput } from 'react-admin';
import React from 'react';

const ScientificNameReference = (props: {
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
    {...props}
  >
    <AutocompleteInput
      optionText="scientific_name"
      validate={props.validate}
      resettable
      filter={props.filter}
      {...props}
    />
  </ReferenceInput>
);

ScientificNameReference.defaultProps = {
  perPage: 100,
  sort: { field: 'canonical_name,author', order: 'ASC,ASC' },
  filter: {},
};

export default ScientificNameReference;
