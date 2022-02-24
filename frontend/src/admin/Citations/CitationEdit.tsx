import React, { FC } from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
} from 'react-admin';

export const CitationEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput source="author_id" />
      <TextInput source="author_type" />
      <TextInput source="author_order" />
    </SimpleForm>
  </Edit>
);
