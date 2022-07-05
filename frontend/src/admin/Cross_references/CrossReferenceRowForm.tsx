import { RowForm } from '@react-admin/ra-editable-datagrid';
import { required, SelectInput, TextInput } from 'react-admin';
import React from 'react';
import { ScientificNameReference } from '../Taxon_names';
import CrossRefType from './CrossRefType';

export const CrossReferenceRowForm = (props: {
  source: string;
  initialValues?: object;
}) => (
  <RowForm sanitizeEmptyValues={false} {...props}>
    <SelectInput
      source="cross_reference_type"
      choices={CrossRefType}
      validate={required()}
    />
    <ScientificNameReference source={props.source} validate={required()} />
    <TextInput
      multiline
      source="reference_comments"
      parse={(value: string) => value}
    />
  </RowForm>
);
