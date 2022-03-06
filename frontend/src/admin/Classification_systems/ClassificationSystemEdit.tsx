import React, { FC } from 'react';
import {
  Edit,
  NumberInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import Aside from '../shared/Aside';
import BooleanOptions from '../shared/BooleanOptions';
import ClassificationType from './ClassificationType';

export const ClassificationSystemEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
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
  </Edit>
);
