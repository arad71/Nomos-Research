import React, { FC } from 'react';
import {
  Edit, required,
  SimpleForm,
  TextInput,
  maxLength, number
} from 'react-admin';

const validatePreferred = [maxLength(1,'Must either be Y or N')]
const validateSortOrder = [number('Must be an integer')]

export const ClassificationSystemEdit: FC = (props) => (
    <Edit {...props}>
      <SimpleForm>
        <TextInput source="class_desc" validate={[required()]}/>
        <TextInput source="class_type" validate={[required()]}/>
        <TextInput source="preferred" validate={validatePreferred}/>
        <TextInput source="sort_order" validate={validateSortOrder}/>
      </SimpleForm>
    </Edit>
);
