import React, { FC } from 'react';
import { Show, SimpleShowLayout, TextField } from 'react-admin';

export const RolesShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <TextField source="role_id" />
        <TextField source="name" />
        <TextField source="description" />
      </SimpleShowLayout>
    </Show>
  );
};
