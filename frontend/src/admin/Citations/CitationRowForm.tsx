import { RowForm, RowFormProps } from '@react-admin/ra-editable-datagrid';
import { AuthorAutocomplete } from '../Authors';
import { NumberInput, required, SelectInput } from 'react-admin';
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
        validate={required()}
        initialValue={0}
      />
    </RowForm>
  );
};
