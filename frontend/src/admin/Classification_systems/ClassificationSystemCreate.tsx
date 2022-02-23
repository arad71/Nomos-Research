import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  required,
} from 'react-admin';

export const ClassificationSystemCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
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
  </Create>
);
