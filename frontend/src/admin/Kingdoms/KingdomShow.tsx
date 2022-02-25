import React, { FC } from 'react';
import { Show, SimpleForm, TextField, NumberField } from 'react-admin';

export const KingdomShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleForm>
        <NumberField source="id" />
        <TextField source="kingdom_name" />
        <TextField component="pre" source="kingdom_desc" />
      </SimpleForm>
    </Show>
  );
};
