import {
  NumberInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  NullableBooleanInput,
} from 'react-admin';
import React, { FC } from 'react';
import ClassificationType from './ClassificationType';

export const ClassSystemCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <TextInput source="class_desc" validate={[required()]} />
    <SelectInput
      source="class_type"
      choices={ClassificationType}
      validate={[required()]}
    />
    <NullableBooleanInput label="Preferred" source="preferred" />
    <NumberInput source="sort_order" />
  </SimpleForm>
);
