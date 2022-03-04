import React, { FC } from 'react';
import {
  required,
  Edit,
  SimpleForm,
  NumberInput,
  SelectInput,
  ReferenceInput,
} from 'react-admin';

export const InformalGroupEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput disabled source="id" />
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
  </Edit>
);
