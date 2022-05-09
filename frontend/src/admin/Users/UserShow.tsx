import React, { FC } from 'react';
import {
  ArrayField,
  BooleanField,
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';

export const UserShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <NumberField source="id" />
        <TextField source="email" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <ArrayField source="user_role">
          <ReferenceField source="role_id" reference="roles">
            <TextField source="name" />
          </ReferenceField>
        </ArrayField>
        <BooleanField source="is_active" />
      </SimpleShowLayout>
    </Show>
  );
};
