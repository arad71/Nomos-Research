import React, { FC } from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';



export const TaxonRankShow: FC = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <TextField source="class_desc" />
        <TextField source="class_type" />
        <TextField source="preferred" />
        <TextField source="sort_order" />
      </SimpleShowLayout>
    </Show>
  );
};
