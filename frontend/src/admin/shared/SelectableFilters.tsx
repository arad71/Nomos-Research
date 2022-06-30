import React from 'react';
import { BooleanInput, SearchInput } from 'react-admin';

export const selectableFilters = [
  <SearchInput source="q" alwaysOn />,
  <BooleanInput label="Soft deleted?" source="deleted" />,
];
