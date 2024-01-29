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
import { addDeletedFilterIfApplicable } from '../shared/SelectableFilters';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';

export const InformalGroupFilters = function () {
  const filters = [
    <SearchInput source="q" alwaysOn />,
    <ScientificNameReference source="taxon_name_id" />,
    <ReferenceArrayInput
      source="classification_system_id"
      reference="classification_systems"
      sort={{ field: 'class_desc', order: 'ASC' }}
    >
      <SelectArrayInput
        optionText="class_desc"
        filter={{ class_type: 'informal' }}
      />
    </ReferenceArrayInput>,
  ];
  addDeletedFilterIfApplicable(filters);
  return filters;
};
