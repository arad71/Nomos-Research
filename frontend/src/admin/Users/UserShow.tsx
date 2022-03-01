import React, { FC } from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  BooleanField,
} from 'react-admin';

export const UserShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <NumberField source="id" />
        <TextField source="email" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <BooleanField source="is_active" />
        <BooleanField source="is_superuser" />
      </SimpleShowLayout>
    </Show>
  );
};
