import {
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanInput,
} from 'react-admin';
import React, { FC } from 'react';
import CrossRefType from './CrossRefType';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    width: '70%',
    gridColumnGap: '1.5em',
  },
}));

export const CrossRefCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm {...props} warnWhenUnsavedChanges>
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Cross reference
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <ReferenceInput source="old_name_id" reference="taxon_names">
          <SelectInput optionText="scientific_name" validate={required()} />
        </ReferenceInput>
        <ReferenceInput source="new_name_id" reference="taxon_names">
          <SelectInput optionText="scientific_name" />
        </ReferenceInput>
        <SelectInput
          source="cross_reference_type"
          choices={CrossRefType}
          validate={required()}
        />
        <TextInput source="authorised_by" />
        <TextInput multiline source="reference_comments" />
        <TextInput multiline source="notes" />
        <BooleanInput
          label="Active"
          source="active"
          validate={required()}
          defaultValue={false}
        />
      </Box>
    </SimpleForm>
  );
};
