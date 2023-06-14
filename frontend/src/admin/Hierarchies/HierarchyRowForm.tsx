import { RowForm, RowFormProps } from '@react-admin/ra-editable-datagrid';
import { FormDataConsumer, SelectInput } from 'react-admin';
import React from 'react';

import { dependentNameInput } from './DependentNameInput';
import TaxonRank from '../Taxon_names/TaxonRank';
import { ClassificationReference } from '../Classification_systems';

export const HierarchyRowForm = (props: RowFormProps) => (
  <RowForm warnWhenUnsavedChanges {...props}>
    <ClassificationReference />
    <SelectInput
      source="taxon_rank_name"
      label="Filter parent rank"
      choices={TaxonRank}
      fullWidth
      helperText="You may filter the parent names by taxonomic rank."
      allowEmpty
      resettable
    />
    <FormDataConsumer>{dependentNameInput}</FormDataConsumer>
  </RowForm>
);
