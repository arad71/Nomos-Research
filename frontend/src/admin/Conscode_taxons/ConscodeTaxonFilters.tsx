import React from 'react';
import {
  BooleanInput,
  SearchInput,
  TextInput,
  ReferenceField,
  SelectArrayInput,
  ReferenceArrayInput,
  AutocompleteArrayInput,
} from 'react-admin';
import ConservationType from '../../kit/shared/choices/ConservationType';
import { addDeletedFilterIfApplicable } from '../shared/SelectableFilters';

export const ConscodeTaxonFilters = function () {
  const filters = [
    <SearchInput source="q" alwaysOn />,

    <TextInput
      source="conservation_code___conservation_code_value"
      label="Conservation code"
    />,
    <SelectArrayInput
      source="conservation_code___authorising_org"
      choices={ConservationType}
      label="Authority"
    />,
  ];
  addDeletedFilterIfApplicable(filters);
  return filters;
};
