import React from 'react';
import { BooleanInput, SearchInput, SelectArrayInput } from 'react-admin';
import ClassificationType from './ClassificationType';

export const ClassificationSystemFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectArrayInput source="class_type" choices={ClassificationType} />,
  <BooleanInput label="Soft deleted?" source="deleted" />,
];
