import React from 'react';
import { SelectArrayInput } from 'react-admin';
import ClassificationType from './ClassificationType';

export const ClassificationSystemFilters = [
  <SelectArrayInput source="class_type" choices={ClassificationType} />,
];
