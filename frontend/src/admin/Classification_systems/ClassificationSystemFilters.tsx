import React from 'react';
import { BooleanInput, SearchInput, SelectArrayInput } from 'react-admin';
import ClassificationType from '../../kit/shared/choices/ClassificationType';
import { addDeletedFilterIfApplicable } from '../shared/SelectableFilters';

export const ClassificationSystemFilters = function () {
  const filters = [
    <SearchInput source="q" alwaysOn />,
    <SelectArrayInput source="class_type" choices={ClassificationType} />,
  ];
  addDeletedFilterIfApplicable(filters);
  return filters;
};
