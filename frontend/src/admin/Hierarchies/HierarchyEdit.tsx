import React, { FC } from 'react';
import {
  Edit,
  SimpleForm,
  SelectInput,
  ReferenceInput,
  required,
  TextInput,
} from 'react-admin';

export const HierarchyEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" disabled />
      <ReferenceInput source="taxon_name_id" reference="taxon_names">
        <SelectInput optionText="rank_name" validate={required()} />
      </ReferenceInput>
      <ReferenceInput
        source="classification_system_id"
        reference="classification_systems"
      >
        <SelectInput optionText="class_desc" validate={required()} />
      </ReferenceInput>
      <ReferenceInput source="parent_nid" reference="taxon_names">
        <SelectInput optionText="rank_name" validate={required()} />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);
