import { RowForm, RowFormProps } from '@react-admin/ra-editable-datagrid';
import {
  FormDataConsumer,
  ReferenceInput,
  required,
  SelectInput,
} from 'react-admin';
import React from 'react';

import { dependentNameInput } from './DependentNameInput';
import TaxonRank from '../Taxon_names/TaxonRank';

export const HierarchyRowForm = (props: RowFormProps) => (
  <RowForm warnWhenUnsavedChanges {...props}>
    <ReferenceInput
      source="classification_system_id"
      reference="classification_systems"
      filter={{ class_type: 'hierarchical' }}
    >
      <SelectInput
        optionText="class_desc"
        validate={required()}
        helperText="Choose a classification system"
      />
    </ReferenceInput>
    <FormDataConsumer>{dependentNameInput}</FormDataConsumer>
    <SelectInput
      source="taxon_rank"
      label="Filter parent rank"
      choices={TaxonRank}
      fullWidth
      helperText="You may filter the parent names by taxonomic rank."
      allowEmpty
      resettable
    />
  </RowForm>
);
