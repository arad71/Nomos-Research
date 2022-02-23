import React, { FC } from 'react';
import {
  Edit,
  required,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
} from 'react-admin';

export const ClassificationSystemEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput disabled source="id" />
      <TextInput source="class_desc" validate={[required()]} />
      <TextInput source="class_type" validate={[required()]} />
      <SelectInput
        source="preferred"
        choices={[
          { id: 'Y', name: 'Y' },
          { id: 'Y', name: 'N' },
        ]}
      />
      <NumberInput source="sort_order" />
    </SimpleForm>
  </Edit>
);
