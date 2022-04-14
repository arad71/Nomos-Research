import React, { FC } from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  BooleanField,
  SelectField,
} from 'react-admin';
import Aside from '../shared/Aside';
import ClassificationType from './ClassificationType';

export const ClassificationSystemShow: FC = (props) => {
  return (
    <Show aside={<Aside />} {...props}>
      <SimpleShowLayout>
        <TextField source="class_desc" />
        <SelectField source="class_type" choices={ClassificationType} />
        <BooleanField source="preferred" />
        <TextField source="sort_order" />
      </SimpleShowLayout>
    </Show>
  );
};
