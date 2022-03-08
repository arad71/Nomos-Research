import React, { FC } from 'react';
import { Create, required, SimpleForm, TextInput } from 'react-admin';

export const AuthorCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="author" validate={[required()]} />
      <TextInput source="surname" />
      <TextInput source="first_names" />
      <TextInput source="initials" />
      <TextInput source="orc_id" />
    </SimpleForm>
  </Create>
);
