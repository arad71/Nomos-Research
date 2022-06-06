import React, { FC } from 'react';
import { SimpleShowLayout, TextField } from 'react-admin';
import { Show } from '@react-admin/ra-rbac';

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
