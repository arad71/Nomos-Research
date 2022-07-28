import { RowForm } from '@react-admin/ra-editable-datagrid';
import { required, SelectInput, TextInput } from 'react-admin';
import React from 'react';
import { ScientificNameReference } from '../Taxon_names';
import CrossRefType from './CrossRefType';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  xRefTypeWidth: {
    width: '230px',
  },
});

export const CrossReferenceRowForm = (props: {
  source: string;
  initialValues?: object;
}) => {
  const classes = useStyles();
  return (
    <RowForm sanitizeEmptyValues={false} {...props}>
      <SelectInput
        source="cross_reference_type"
        choices={CrossRefType}
        validate={required()}
        className={classes.xRefTypeWidth}
      />
      <ScientificNameReference source={props.source} validate={required()} />
      <TextInput
        multiline
        source="reference_comments"
        parse={(value: string) => value}
      />
    </RowForm>
  );
};
