import {
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanInput,
  AutocompleteInput,
} from 'react-admin';
import React, { FC } from 'react';
import CrossRefType from './CrossRefType';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';
import EditToolbar from '../shared/EditToolbar';

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
        <ReferenceInput
          source="old_name_id"
          reference="taxon_names"
          sort={{ field: 'scientific_name', order: 'ASC' }}
          perPage={100}
        >
          <AutocompleteInput
            optionText="scientific_name"
            validate={required()}
            resettable
          />
        </ReferenceInput>
        <ReferenceInput
          source="new_name_id"
          reference="taxon_names"
          sort={{ field: 'scientific_name', order: 'ASC' }}
          perPage={100}
        >
          <AutocompleteInput optionText="scientific_name" resettable />
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
