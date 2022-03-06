import React, { FC } from 'react';
import {
  BooleanInput,
  Edit,
  NumberInput,
  PasswordInput,
  SimpleForm,
  TextInput,
} from 'react-admin';

export const UserEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput disabled source="id" />
      <TextInput source="email" />
      <TextInput source="first_name" />
      <TextInput source="last_name" />
      <PasswordInput source="password" />
      <BooleanInput source="is_active" />
      <BooleanInput source="is_superuser" />
    </SimpleForm>
  </Edit>
);
