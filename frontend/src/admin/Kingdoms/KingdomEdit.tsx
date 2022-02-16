import React, { FC } from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
} from 'react-admin';

export const KingdomEdit: FC = (props) => (
    <Edit {...props}>
      <SimpleForm>
        <TextInput disabled source="kingdom_id" />
        <TextInput source="kingdom_name" />
        <TextInput source="kingdom_desc" />
      </SimpleForm>
    </Edit>
);
