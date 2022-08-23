import {
  FormDataConsumer,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
} from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, makeStyles, Typography } from '@material-ui/core';
import EditToolbar from '../shared/EditToolbar';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';
import TaxonRank from '../Taxon_names/TaxonRank';
import { dependentNameInput } from './DependentNameInput';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '100%',
    gridColumnGap: '1.5em',
  },
}));

export const HierarchyCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="hierarchies" />}
      warnWhenUnsavedChanges
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Hierarchy
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <Box>
          <ReferenceInput
            source="classification_system_id"
            reference="classification_systems"
            filter={{ class_type: 'hierarchical' }}
          >
            <SelectInput
              optionText="class_desc"
              validate={required()}
              fullWidth
              helperText="Choose a classification system"
            />
          </ReferenceInput>
        </Box>

        <Box>
          <ScientificNameReference
            source="taxon_name_id"
            label="Taxon name"
            fullWidth
            helperText="Specify the name you are dealing with."
            validate={required()}
          />
        </Box>
        <Box>
          <FormDataConsumer>{dependentNameInput}</FormDataConsumer>
        </Box>
        <Box>
          <SelectInput
            source="taxon_rank"
            label="Filter parent rank"
            choices={TaxonRank}
            fullWidth
            helperText="You may filter the parent names by taxonomic rank."
            allowEmpty
            resettable
          />
        </Box>
      </Box>
    </SimpleForm>
  );
};
