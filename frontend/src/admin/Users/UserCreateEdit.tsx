import {
  BooleanInput,
  PasswordInput,
  SimpleForm,
  TextInput,
} from 'react-admin';

import React, { FC } from 'react';

export const UserCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <TextInput source="email" />
    <TextInput source="first_name" />
    <TextInput source="last_name" />
    <PasswordInput source="password" />
    <BooleanInput source="is_active" />
  </SimpleForm>
);
