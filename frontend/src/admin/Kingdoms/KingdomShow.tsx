import React, { FC } from 'react';
import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';

export const KingdomShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <NumberField source="id" />
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
      </SimpleShowLayout>
    </Show>
  );
};
