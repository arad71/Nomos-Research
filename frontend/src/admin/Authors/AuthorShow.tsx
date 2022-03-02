import React, { FC } from 'react';
import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';
import Aside from "../shared/Aside";

export const AuthorShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
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
