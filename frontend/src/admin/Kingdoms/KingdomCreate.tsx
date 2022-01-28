import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  TextField,
  PasswordInput,
  BooleanInput,
} from 'react-admin';

export const KingdomCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextField record={props} source="Who goes there"/>
      <TextInput source="kingdom_name" />
      <TextInput multiline source="kingdom_desc" />
    </SimpleForm>
  </Create>
);
