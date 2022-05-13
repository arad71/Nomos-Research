import React, { FC } from 'react';
import { ReferenceField } from 'react-admin';
import { Show, SimpleShowLayout, TextField } from 'react-admin';

export const UserRoleShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="user_id" />
        <TextField source="role_id" />
        <ReferenceField label="Roles" source="role" reference="user_roles">
          <TextField source="name" />
        </ReferenceField>
      </SimpleShowLayout>
    </Show>
  );
};
