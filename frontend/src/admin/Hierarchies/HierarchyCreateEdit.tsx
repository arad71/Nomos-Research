import { ReferenceInput, required, SelectInput, SimpleForm } from 'react-admin';
import React, { FC } from 'react';
import { ScientificNameReference } from '../Taxon_names';

export const HierarchyCreateEdit: FC = (props) => (
  <SimpleForm {...props} warnWhenUnsavedChanges>
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
    <ScientificNameReference
      source="taxon_name_id"
      label="Taxon name"
      validate={required()}
    />
  </SimpleForm>
);
