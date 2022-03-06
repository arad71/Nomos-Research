import React, { FC } from 'react';
import { Edit, SimpleForm, TextInput } from 'react-admin';
import Aside from '../shared/Aside';

export const KingdomEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <SimpleForm>
      <TextInput source="kingdom_name" />
      <TextInput multiline source="kingdom_desc" />
    </SimpleForm>
  </Edit>
);
