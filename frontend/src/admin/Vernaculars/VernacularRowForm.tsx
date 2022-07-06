import { RowForm, RowFormProps } from '@react-admin/ra-editable-datagrid';
import {
  NumberInput,
  required,
  SelectInput,
  BooleanInput,
  TextInput,
} from 'react-admin';
import LanguageType from './LanguageType';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  langWidth: {
    width: '150px',
  },
});

export const VernacularRowForm = (props: RowFormProps) => {
  const classes = useStyles();
  return (
    <RowForm {...props}>
      <TextInput source="vernacular" validate={required()} />
      <SelectInput
        source="language"
        validate={required()}
        choices={LanguageType}
        className={classes.langWidth}
      />
      <BooleanInput source="lang_pref" />
      <BooleanInput source="preferred" />
      <NumberInput source="sort_order" validate={required()} initialValue={0} />
    </RowForm>
  );
};
