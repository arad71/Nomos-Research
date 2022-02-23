import React, { FC } from 'react';
import { Edit, SimpleForm, NumberInput, TextInput } from 'react-admin';

export const KingdomEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <NumberInput disabled source="id" />
      <TextInput source="kingdom_name" />
      <TextInput multiline source="kingdom_desc" />
    </SimpleForm>
  </Edit>
);
