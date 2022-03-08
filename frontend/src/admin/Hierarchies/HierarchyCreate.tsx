import React, { FC } from 'react';
import {
  Create,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
} from 'react-admin';

export const HierarchyCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
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
  </Create>
);
