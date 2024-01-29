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
//import ConservationType from '../Conservation_codes/ConservationType';
import { addDeletedFilterIfApplicable } from '../shared/SelectableFilters';

export const InformalGroupFilters = function () {
  const filters = [
    <SearchInput source="q" alwaysOn />,
    <ReferenceArrayInput
      source="taxon_name_id"
      reference="taxon_names"
      sort={{ field: 'formatted_scientific_name', order: 'ASC' }}
    >
      <AutocompleteArrayInput optionText="scientific_name" />
    </ReferenceArrayInput>,
    <ReferenceArrayInput
      source="classification_system_id"
      reference="classification_systems"
      sort={{ field: 'class_desc', order: 'ASC' }}
    >
      <AutocompleteArrayInput optionText="class_desc" />
    </ReferenceArrayInput>,
  ];
  addDeletedFilterIfApplicable(filters);
  return filters;
};
