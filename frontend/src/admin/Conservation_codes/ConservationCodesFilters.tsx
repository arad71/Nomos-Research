import React from 'react';
import {
  BooleanInput,
  SearchInput,
  TextInput,
  SelectArrayInput,
  ReferenceArrayInput,
  AutocompleteArrayInput,
  minValue,
  number,
} from 'react-admin';
import ConservationType from './ConservationType';
import { addDeletedFilterIfApplicable } from '../shared/SelectableFilters';

export const ConservationCodesFilters = function () {
  const filters = [
    <SearchInput source="q" alwaysOn />,
    <SelectArrayInput source="authorising_org" choices={ConservationType} />,
  ];
  addDeletedFilterIfApplicable(filters);
  return filters;
};
