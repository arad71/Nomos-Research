import { InlineRowForm as RowForm } from '../../kit/shared/InlineRowForm';
import { required, SelectInput, TextInput } from 'react-admin';
import React from 'react';
import CrossRefType from '../../kit/shared/choices/CrossRefType';
import makeStyles from 'lib/makeStyles';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';

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
