import React, { FC } from 'react';
import {Show, SimpleShowLayout, TextField, NumberField} from 'react-admin';
import Aside from '../shared/Aside'

export const KingdomShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <NumberField source="id" />
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
      </SimpleShowLayout>
    </Show>
  );
};
