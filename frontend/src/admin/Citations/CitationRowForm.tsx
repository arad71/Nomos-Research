import { RowForm, RowFormProps } from '@react-admin/ra-editable-datagrid';
import { AuthorAutocomplete } from '../Authors';
import { NumberInput, required, minValue, SelectInput } from 'react-admin';
import AuthorType from './AuthorType';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  authTypeWidth: {
    width: '230px',
  },
});

export const CitationRowForm = (props: RowFormProps) => {
  const classes = useStyles();
  const authorOrderValidation = [required(), minValue(0)];
  return (
    <RowForm warnWhenUnsavedChanges {...props}>
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
        initialValue={0}
        min={0}
      />
    </RowForm>
  );
};
