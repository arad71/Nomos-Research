import React, { FC } from 'react';
import {
  Edit,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
} from 'react-admin';
import Aside from '../shared/Aside';

export const InformalGroupEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
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
  </Edit>
);
