import React from 'react';
import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceArrayInput,
  SearchInput,
  SelectArrayInput,
} from 'react-admin';
import TaxonRank from '../Taxon_names/TaxonRank';
import { ScientificNameReference } from '../Taxon_names';

export const HierarchyFilters = [
  <SearchInput source="q" alwaysOn />,

  <ScientificNameReference
    source="path__ltxtquery"
    label="Higher classification"
  />,
  <SelectArrayInput
    source="parent_name___taxon_rank___rank_name"
    label="Parent rank"
    choices={TaxonRank}
    helpText="Choose a taxon rank"
    resettable
    allowEmpty
  />,
  <SelectArrayInput
    source="taxon_name___taxon_rank___rank_name"
    label="Taxon rank"
    choices={TaxonRank}
    helpText="Choose a taxon rank"
  />,
  <ReferenceArrayInput
    label="Classification system"
    source="classification_system___classification_system_id"
    reference="classification_systems"
    filter={{ class_type: 'hierarchical' }}
    sort={{ field: 'class_desc', order: 'ASC' }}
  >
    <SelectArrayInput optionText="class_desc" />
  </ReferenceArrayInput>,
];
