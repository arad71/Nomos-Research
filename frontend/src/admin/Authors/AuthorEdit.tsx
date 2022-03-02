import React, { FC } from 'react';
import {
  Edit,
  required,
  SimpleForm,
  TextInput,
  NumberInput,
} from 'react-admin';

export const AuthorEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput disabled source="id" />
      <TextInput source="author" validate={[required()]} />
      <TextInput source="surname" />
      <TextInput source="first_names" />
      <TextInput source="initials" />
      <TextInput source="orc_id" />
    </SimpleForm>
  </Edit>
);
