import React, { FC } from 'react';
import { Create, required, SimpleForm, TextInput } from 'react-admin';

export const KingdomCreate: FC = (props) => {
  return (
    <Create {...props}>
      <SimpleForm>
        <TextInput source="kingdom_name" validate={[required()]} />
        <TextInput multiline source="kingdom_desc" />
      </SimpleForm>
    </Create>
  );
};
