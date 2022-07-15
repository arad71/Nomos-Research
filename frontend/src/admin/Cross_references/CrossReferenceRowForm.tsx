import { RowForm } from '@react-admin/ra-editable-datagrid';
import { required, SelectInput, TextInput } from 'react-admin';
import React from 'react';
import CrossRefType from './CrossRefType';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';

export const CrossReferenceRowForm = (props: {
  source: string;
  initialValues?: object;
}) => (
  <RowForm {...props}>
    <SelectInput
      source="cross_reference_type"
      choices={CrossRefType}
      validate={required()}
    />
    <ScientificNameReference source={props.source} validate={required()} />
    <TextInput multiline source="comments" />
  </RowForm>
);
