import { RowForm, RowFormProps } from '@react-admin/ra-editable-datagrid';
import { ReferenceInput, required, SelectInput } from 'react-admin';
import React from 'react';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';

export const HierarchyRowForm = (props: RowFormProps) => (
  <RowForm warnWhenUnsavedChanges {...props}>
    <ReferenceInput
      source="classification_system_id"
      reference="classification_systems"
      filter={{ class_type: 'hierarchical' }}
    >
      <SelectInput optionText="class_desc" validate={required()} />
    </ReferenceInput>
    <ScientificNameReference
      source="parent_nid"
      label="Parent name"
      validate={required()}
    />
  </RowForm>
);
