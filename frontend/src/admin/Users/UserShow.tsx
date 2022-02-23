import React, { FC } from 'react';
import {
  Show,
  SimpleForm,
  TextField,
  NumberField,
  BooleanField,
} from 'react-admin';

export const UserShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleForm>
        <NumberField source="id" />
        <TextField source="email" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <BooleanField source="is_active" />
        <BooleanField source="is_superuser" />
      </SimpleForm>
    </Show>
  );
};
