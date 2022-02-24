import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  number,
} from 'react-admin';

const validateOrcId = [number('Must be an integer')]

export const AuthorCreate: FC = (props) => (
    <Create {...props}>
      <SimpleForm>
        <TextInput source="author" validate={[required()]}/>
        <TextInput source="surname" />
        <TextInput source="first_names" />
        <TextInput source="initials" />
        <TextInput source="orc_id" validate={validateOrcId}/>
      </SimpleForm>
    </Create>
);