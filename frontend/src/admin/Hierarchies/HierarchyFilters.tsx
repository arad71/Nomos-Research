import React from 'react';
import {
  ReferenceArrayInput,
  SearchInput,
  SelectArrayInput,
} from 'react-admin';
import TaxonRank from '../../kit/shared/choices/TaxonRank';
import ScientificNameReference from '../../kit/taxon-names/ScientificNameReference';
import { addDeletedFilterIfApplicable } from '../../kit/shared/SelectableFilters';

export const HierarchyFilters = () => {
  const filters = [
    <SearchInput source="q" alwaysOn />,

    <ScientificNameReference
      source="path__ltxtquery"
      label="Higher classification"
    />,
    <ScientificNameReference source="parent_nid" label="Parent name" />,
    <ScientificNameReference source="taxon_name_id" label="Taxon name" />,
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
  addDeletedFilterIfApplicable(filters);
  return filters;
};
