import { AutocompleteInput, ReferenceInput, required } from 'react-admin';
import React from 'react';

export const AuthorAutocomplete = () => (
  <ReferenceInput
    source="author_id"
    reference="authors"
    sort={{ field: 'abbreviation', direction: 'ASC' }}
    perPage={200}
  >
    <AutocompleteInput
      optionText="abbreviation"
      validate={required()}
      noOptionsText="Type at least 2 characters to search"
      shouldRenderSuggestions={(val: string) => {
        return val.trim().length > 1;
      }}
    />
  </ReferenceInput>
);
