import React from 'react';
import { SearchInput, SelectArrayInput } from 'react-admin';
import ClassificationType from './ClassificationType';

export const ClassificationSystemFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectArrayInput source="class_type" choices={ClassificationType} />,
];
