import React from 'react';
import { SearchInput, SelectArrayInput } from 'react-admin';
import { addDeletedFilterIfApplicable } from '../shared/SelectableFilters';
import CrossRefType from '../../kit/shared/choices/CrossRefType';

export const CrossReferenceFilters = () => {
  const filters = [
    <SearchInput source="q" alwaysOn />,
    <SelectArrayInput
      source="cross_reference_type"
      label="Cross reference type"
      choices={CrossRefType}
    />,
  ];
  addDeletedFilterIfApplicable(filters);
  return filters;
};
