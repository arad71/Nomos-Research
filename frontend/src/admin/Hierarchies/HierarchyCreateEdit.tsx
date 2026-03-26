import {
  FormDataConsumer,
  required,
  SelectInput,
  SimpleForm,
} from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@mui/material';
import makeStyles from 'lib/makeStyles';
import EditToolbar from '../shared/EditToolbar';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';
import TaxonRank from '../../kit/shared/choices/TaxonRank';
import { dependentNameInput } from './DependentNameInput';
import { ClassificationReference } from '../Classification_systems';

const useStyles = makeStyles((theme: any) => ({
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
    <SimpleForm {...props} toolbar={<EditToolbar resource="hierarchies" />}>
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Hierarchy
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <Box>
          <ClassificationReference />
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
          <SelectInput
            source="taxon_rank_name"
            label="Filter parent rank"
            choices={TaxonRank}
            fullWidth
            helperText="You may filter the parent names by taxonomic rank."
            allowEmpty
            resettable
          />
        </Box>
        <Box>
          <FormDataConsumer>{dependentNameInput}</FormDataConsumer>
        </Box>
      </Box>
    </SimpleForm>
  );
};
