import React, { FC } from 'react';
import { SimpleShowLayout, TextField } from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';

export const KingdomShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <TextField source="kingdom_name" />
        <TextField source="kingdom_desc" />
      </SimpleShowLayout>
    </Show>
  );
};
