import { ReferenceInput, required, SelectInput, SimpleForm } from 'react-admin';
import React, { FC } from 'react';

export const HierarchyCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <ReferenceInput source="taxon_name_id" reference="taxon_names">
      <SelectInput optionText="scientific_name" validate={required()} />
    </ReferenceInput>
    <ReferenceInput
      source="classification_system_id"
      reference="classification_systems"
    >
      <SelectInput optionText="class_desc" validate={required()} />
    </ReferenceInput>
    <ReferenceInput source="parent_nid" reference="taxon_names">
      <SelectInput optionText="scientific_name" validate={required()} />
    </ReferenceInput>
  </SimpleForm>
);
