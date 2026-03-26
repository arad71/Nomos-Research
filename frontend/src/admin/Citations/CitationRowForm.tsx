import {
  InlineRowForm as RowForm,
  InlineRowFormProps as RowFormProps,
} from '../shared/InlineRowForm';
import { AuthorAutocomplete } from '../Authors/AuthorAutocomplete';
import { NumberInput, required, minValue, SelectInput } from 'react-admin';
import AuthorType from '../../kit/shared/choices/AuthorType';
import React from 'react';
import makeStyles from 'lib/makeStyles';

const useStyles = makeStyles({
  authTypeWidth: {
    width: '230px',
  },
});

export const CitationRowForm = (props: RowFormProps) => {
  const classes = useStyles();
  const authorOrderValidation = [required(), minValue(0)];
  return (
    <RowForm {...props}>
      <AuthorAutocomplete />
      <SelectInput
        source="author_type"
        validate={required()}
        choices={AuthorType}
        className={classes.authTypeWidth}
      />
      <NumberInput
        source="author_order"
        validate={authorOrderValidation}
        defaultValue={0}
        min={0}
      />
    </RowForm>
  );
};
