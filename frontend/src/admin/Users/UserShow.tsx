import React, { FC } from 'react';
import {
  BooleanField,
  NumberField,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import Aside from '../shared/Aside';

export const UserShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <TextField source="email" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <BooleanField source="is_active" />
      </SimpleShowLayout>
    </Show>
  );
};
