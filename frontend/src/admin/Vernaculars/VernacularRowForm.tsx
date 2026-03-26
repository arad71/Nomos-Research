import {
  InlineRowForm as RowForm,
  InlineRowFormProps as RowFormProps,
} from '../shared/InlineRowForm';
import {
  NumberInput,
  required,
  SelectInput,
  BooleanInput,
  TextInput,
  minValue,
} from 'react-admin';
import LanguageType from '../../kit/shared/choices/LanguageType';
import React from 'react';
import makeStyles from 'lib/makeStyles';

const useStyles = makeStyles({
  langWidth: {
    width: '150px',
  },
});

export const VernacularRowForm = (props: RowFormProps) => {
  const sortOrderValidation = [required(), minValue(0)];
  const classes = useStyles();
  return (
    <RowForm {...props}>
      <TextInput source="vernacular_name" validate={required()} />
      <SelectInput
        source="language"
        validate={required()}
        choices={LanguageType}
        className={classes.langWidth}
      />
      <BooleanInput source="lang_pref" />
      <BooleanInput source="preferred" />
      <NumberInput
        source="sort_order"
        validate={sortOrderValidation}
        defaultValue={0}
        min={0}
      />
    </RowForm>
  );
};
