import React, { FC } from 'react';
import {
  Edit, required,
  SimpleForm,
  TextInput,
  maxLength, number
} from 'react-admin';

const validateOrcId = [number('Must be an integer')]

export const AuthorEdit: FC = (props) => (
    <Edit {...props}>
      <SimpleForm>
        <TextInput source="author" validate={[required()]}/>
        <TextInput source="surname" />
        <TextInput source="first_names" />
        <TextInput source="initials" />
        <TextInput source="orc_id" validate={validateOrcId}/>
      </SimpleForm>
    </Edit>
);
