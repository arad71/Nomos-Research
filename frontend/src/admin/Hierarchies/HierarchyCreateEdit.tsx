import {
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextField,
} from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';
import EditToolbar from '../shared/EditToolbar';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '70%',
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
            <SelectInput optionText="class_desc" validate={required()} />
          </ReferenceInput>
        </Box>
        <Box>
          <ScientificNameReference
            source="parent_nid"
            label="Parent name"
            validate={required()}
          />
        </Box>
        <Box>
          <ScientificNameReference
            source="taxon_name_id"
            label="Taxon name"
            validate={required()}
          />
        </Box>
      </Box>
    </SimpleForm>
  );
};
