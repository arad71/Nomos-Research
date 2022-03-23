import React, { FC } from 'react';
import { Show, SimpleShowLayout, TextField } from 'react-admin';
import Aside from '../shared/Aside';

export const ClassificationSystemShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <TextField source="class_desc" />
        <TextField source="class_type" />
        <TextField source="preferred" />
        <TextField source="sort_order" />
      </SimpleShowLayout>
    </Show>
  );
};
