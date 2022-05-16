import React, { FC } from 'react';
import {
  ArrayField,
  BooleanField,
  ChipField,
  NumberField,
  ReferenceArrayField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  SingleFieldList,
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
        <ReferenceArrayField
          label="User Roles"
          reference="roles"
          source="role_ids"
        >
          <SingleFieldList>
            <ChipField source="name" />
          </SingleFieldList>
        </ReferenceArrayField>
        <BooleanField source="is_active" />
      </SimpleShowLayout>
    </Show>
  );
};
