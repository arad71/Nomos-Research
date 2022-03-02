import React, { FC } from 'react';
import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';

export const AuthorShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <NumberField source="id" />
        <TextField source="author" />
        <TextField source="surname" />
        <TextField source="first_names" />
        <TextField source="initials" />
        <TextField source="orc_id" />
      </SimpleShowLayout>
    </Show>
  );
};
