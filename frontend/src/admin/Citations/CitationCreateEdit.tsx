import {
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  AutocompleteInput,
} from 'react-admin';
import React, { FC } from 'react';
import AuthorType from './AuthorType';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';
import EditToolbar from '../shared/EditToolbar';
import { ScientificNameReference } from '../Taxon_names';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '70%',
    gridColumnGap: '1.5em',
  },
}));

export const CitationCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="citations" />}
      warnWhenUnsavedChanges
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Citation
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <Box>
          <ScientificNameReference
            source="taxon_name_id"
            validate={required()}
          />
        </Box>
        <Box>
          <ReferenceInput
            source="author_id"
            reference="authors"
            validate={required()}
            sort={{ field: 'abbreviation', order: 'ASC' }}
            perPage={100}
          >
            <AutocompleteInput optionText="abbreviation" resettable />
          </ReferenceInput>
        </Box>
        <Box>
          <SelectInput source="author_type" choices={AuthorType} />
        </Box>
        <Box>
          <NumberInput
            source="author_order"
            validate={required()}
            initialValue={0}
            fullWidth
          />
        </Box>
      </Box>
    </SimpleForm>
  );
};
