import React, { FC } from 'react';
import {
  Edit,
  SimpleForm,
  SelectInput,
  ReferenceInput,
  required, TextInput,
} from 'react-admin';

export const HierarchyEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <ReferenceInput
          source="taxon_name_id"
          reference="taxon_names"
          validate={required()}
      >
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
      <ReferenceInput
          source="classification_system_id"
          reference="classification_systems"
      >
        <SelectInput optionText="class_desc" />
      </ReferenceInput>
      <ReferenceInput
          source="parent_nid"
          reference="taxon_names"
          validate={required()}
      >
        <SelectInput optionText="rank_name" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);
