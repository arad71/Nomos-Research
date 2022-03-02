import React, { FC } from 'react';
import { NumberField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const ClassificationSystemShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <NumberField source="id" />
        <TextField source="class_desc" />
        <TextField source="class_type" />
        <TextField source="preferred" />
        <TextField source="sort_order" />
      </SimpleShowLayout>
    </Show>
  );
};
