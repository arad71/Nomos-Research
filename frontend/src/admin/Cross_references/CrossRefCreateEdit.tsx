import {
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
import EditToolbar from '../shared/EditToolbar';
import { ScientificNameReference } from '../Taxon_names';

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
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="cross_references" />}
      warnWhenUnsavedChanges
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Related name
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <ScientificNameReference source="old_name_id" validate={required()} />
        <ScientificNameReference source="new_name_id" />
        <SelectInput
          source="cross_reference_type"
          choices={CrossRefType}
          validate={required()}
        />
        <TextInput source="authorised_by" />
        <TextInput multiline source="reference_comments" />
        <TextInput multiline source="notes" />
      </Box>
    </SimpleForm>
  );
};
