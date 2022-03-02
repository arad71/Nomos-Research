import React, { FC } from 'react';
import {
  required,
  Create,
  SimpleForm,
  SelectInput,
  ReferenceInput,
} from 'react-admin';

export const InformalGroupCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput
        source="classification_system_id"
        reference="classification_systems"
      >
        <SelectInput optionText="class_desc" validate={required()} />
      </ReferenceInput>
      <ReferenceInput source="taxon_name_id" reference="taxon_names">
        <SelectInput optionText="scientific_name" validate={required()} />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);
