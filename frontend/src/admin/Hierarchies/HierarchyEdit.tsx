import React, { FC } from 'react';
import {
  Edit,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
} from 'react-admin';
import Aside from '../shared/Aside';

export const HierarchyEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
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
  </Edit>
);
