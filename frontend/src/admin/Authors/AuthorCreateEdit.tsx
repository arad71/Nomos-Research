import { required, SimpleForm, TextInput } from 'react-admin';
import React, { FC } from 'react';

export const AuthorCreateEdit: FC = (props) => (
  <SimpleForm {...props}>
    <TextInput source="author" validate={[required()]} />
    <TextInput source="surname" />
    <TextInput source="first_names" />
    <TextInput source="initials" />
    <TextInput source="orc_id" />
  </SimpleForm>
);
