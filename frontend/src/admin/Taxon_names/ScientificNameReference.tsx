import { AutocompleteInput, ReferenceInput } from 'react-admin';
import React from 'react';

export function ScientificNameReference(props: {
  source: string;
  label?: string;
  sort?: object;
  validate?: any;
  perPage?: number;
}) {
  return (
    <ReferenceInput
      reference="taxon_names"
      filterToQuery={(searchText: string) => ({
        scientific_name__ilike: `%${searchText}%`,
      })}
      sort={{ field: 'scientific_name', order: 'ASC' }}
      perPage={100}
      {...props}
    >
      <AutocompleteInput
        optionText="scientific_name"
        validate={props.validate}
        resettable
      />
    </ReferenceInput>
  );
}

ScientificNameReference.defaultProps = {
  perPage: 500,
  sort: { field: 'scientific_name', order: 'ASC' },
};
