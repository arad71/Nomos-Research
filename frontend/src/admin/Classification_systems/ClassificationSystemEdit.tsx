import React, { FC } from 'react';
import {
  Edit,
  required,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
} from 'react-admin';
import BooleanOptions from "../shared/BooleanOptions";
import ClassificationType from "./ClassificationType";

export const ClassificationSystemEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput disabled source="id" />
      <TextInput source="class_desc" validate={[required()]} />
      <SelectInput source="class_type" choices={ClassificationType} validate={[required()]} />
      <SelectInput source="preferred" choices={BooleanOptions} />
      <NumberInput source="sort_order" />
    </SimpleForm>
  </Edit>
);
