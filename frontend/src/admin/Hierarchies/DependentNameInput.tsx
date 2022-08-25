import { HierarchyFilterType } from './HierarchyFilterType';
import { AutocompleteInput, ReferenceInput, required } from 'react-admin';
import React from 'react';
import { HierarchyFormDataProps } from './HierarchyFormDataProps';

export const dependentNameInput = ({
  formData,
  ...rest
}: HierarchyFormDataProps) => {
  let enabled = true;
  if (!formData.classification_system_id || !formData.taxon_name_id) {
    enabled = false;
  }
  const taxon = formData.taxon_name_id;
  let filter: HierarchyFilterType = {
    taxon_name___scientific_name__gt: '',
    // Don't load the current name
    taxon_name_id__ne: taxon,
    classification_system_id: formData.classification_system_id,
  };
  if (formData?.taxon_rank) {
    filter.taxon_name___taxon_rank___rank_name = formData.taxon_rank;
  }
  // Does not contain the taxon id in the path
  filter.path__ltxtquery = `!${taxon}`;
  return (
    <ReferenceInput
      source="parent_nid"
      reference="hierarchies/parents"
      label="Parent name"
      validate={[required()]}
      filter={filter}
      sort={{
        field: 'taxon_name___canonical_name,taxon_name___author',
        order: 'ASC,ASC',
      }}
      perPage={25}
      {...rest}
    >
      <AutocompleteInput
        optionText="scientific_name"
        disabled={!enabled}
        resettable
        fullWidth
        /* eslint-disable-next-line max-len */
        helperText="Please select a name that will act as a parent of this name. Requires classification system and taxon name to be set."
        {...rest}
      />
    </ReferenceInput>
  );
};
