import React, { FC } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  maxLength,
  number,
} from 'react-admin';

const validatePreferred = [maxLength(1,'Must either be Y or N')]
const validateSortOrder = [number('Must be an integer')]

export const ClassificationSystemCreate: FC = (props) => (
    <Create {...props}>
      <SimpleForm>
        <TextInput source="class_desc" validate={[required()]}/>
        <TextInput source="class_type" validate={[required()]}/>
        <TextInput source="preferred" validate={validatePreferred}/>
        <TextInput source="sort_order" validate={validateSortOrder}/>
      </SimpleForm>
    </Create>
);