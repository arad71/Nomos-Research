import React, { FC } from 'react';
import { Edit, required, SimpleForm, TextInput } from 'react-admin';
import Aside from '../shared/Aside';

export const AuthorEdit: FC = (props) => (
  <Edit {...props} aside={<Aside />}>
    <SimpleForm>
      <TextInput source="author" validate={[required()]} />
      <TextInput source="surname" />
      <TextInput source="first_names" />
      <TextInput source="initials" />
      <TextInput source="orc_id" />
    </SimpleForm>
  </Edit>
);
