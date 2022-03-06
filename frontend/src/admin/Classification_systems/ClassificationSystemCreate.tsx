import React, { FC } from 'react';
import {
  Create,
  NumberInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import BooleanOptions from '../shared/BooleanOptions';
import ClassificationType from './ClassificationType';

export const ClassificationSystemCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="class_desc" validate={[required()]} />
      <SelectInput
        source="class_type"
        choices={ClassificationType}
        validate={[required()]}
      />
      <SelectInput source="preferred" choices={BooleanOptions} />
      <NumberInput source="sort_order" />
    </SimpleForm>
  </Create>
);
